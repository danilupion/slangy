import Method from '@danilupion/turbo-common/http/method.js';
import { ValidationError as MappedValidationError } from '@danilupion/turbo-common/rest/error.js';
import { Handler, NextFunction, Router } from 'express';
import { FieldValidationError, ValidationChain, validationResult } from 'express-validator';
import { ValidationError } from 'express-validator/src/base.js';
import { MongoServerError } from 'mongodb';

import {
  BaseHttpException,
  ClientErrorBadRequest,
  ClientErrorConflict,
  ServerErrorInternalServerError,
} from '../httpError.js';

import { Controller, Request, Response } from './controller.js';

type CustomValidationError = {
  field: string;
  message: string;
};

const extractFieldValidationErrors = (error: ValidationError): FieldValidationError[] => {
  if (error.type === 'field') {
    return [error];
  } else if (error.type === 'alternative' || error.type === 'alternative_grouped') {
    return error.nestedErrors.flat().flatMap(extractFieldValidationErrors);
  } else {
    // You can handle 'unknown_fields' errors here if necessary
    return [];
  }
};

const errorNormalizer = (
  error: ValidationError,
): CustomValidationError | CustomValidationError[] => {
  const fieldErrors = extractFieldValidationErrors(error);

  return fieldErrors.map((fieldError) => ({
    field: fieldError.path,
    message: fieldError.msg,
  }));
};

const validationErrors = validationResult.withDefaults({
  formatter: errorNormalizer,
});

const errorMapper = (
  errors: (CustomValidationError | CustomValidationError[])[],
): MappedValidationError => {
  return errors.flat().reduce((acc, curr) => {
    if (curr.field === '_error') {
      const currentMessages = acc[curr.field] ?? [];
      return {
        ...acc,
        [curr.field]: currentMessages.includes(curr.message)
          ? currentMessages
          : [...currentMessages, curr.message],
      };
    } else {
      const currentMessages = acc[curr.field] ?? [];
      return {
        ...acc,
        [curr.field]: currentMessages.includes(curr.message)
          ? currentMessages
          : [...currentMessages, curr.message],
      };
    }
  }, {} as MappedValidationError);
};

const secureHandler =
  <Req extends Request, Res extends Response>(insecureHandler: Controller<Req, Res>) =>
  async (req: Req, res: Res, next: NextFunction) => {
    try {
      const errors = validationErrors(req);

      if (!errors.isEmpty()) {
        return next(new ClientErrorBadRequest(errorMapper(errors.array())));
      }

      return await insecureHandler(req, res, next);
    } catch (err) {
      if (err instanceof BaseHttpException) {
        return next(err);
        // Duplicate key error
      } else if (err instanceof MongoServerError && err.code === 11000) {
        return next(new ClientErrorConflict());
      }

      return next(new ServerErrorInternalServerError(err instanceof Error ? err : undefined));
    }
  };

type Middleware = ValidationChain | Handler | (ValidationChain | Handler)[];

const isValidationChain = (h: Middleware): h is ValidationChain | ValidationChain[] => {
  return Array.isArray(h) || (h as ValidationChain).builder !== undefined;
};

const methodFactory =
  (method: Method) =>
  <Req extends Request, Res extends Response>(
    router: Router,
    path: string,
    ...middleWare: [...Middleware[], Controller<Req, Res>]
  ) => {
    router[method](
      path,
      ...(middleWare as Handler[]).map((m) => (isValidationChain(m) ? m : secureHandler(m))),
    );
  };

export const getRoute = methodFactory(Method.GET);
export const postRoute = methodFactory(Method.POST);
export const putRoute = methodFactory(Method.PUT);
export const patchRoute = methodFactory(Method.PATCH);
export const deleteRoute = methodFactory(Method.DELETE);
export const optionsRoute = methodFactory(Method.OPTIONS);
export const headRoute = methodFactory(Method.HEAD);
