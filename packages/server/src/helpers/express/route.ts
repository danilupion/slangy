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

const validationErrorMapper = (
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

const errorMap = {
  [BaseHttpException.name]: (err: Error) => err,
  [MongoServerError.name]: (err: Error) => {
    if (err instanceof MongoServerError && err.code === 11000) {
      return new ClientErrorConflict();
    }
    return new ServerErrorInternalServerError(err);
  },
};

const errorMapper = (err: Error) => {
  const mapper = errorMap[err.constructor.name];
  return mapper ? mapper(err) : new ServerErrorInternalServerError(err);
};

const secureHandler =
  <Req extends Request, Res extends Response>(insecureHandler: Controller<Req, Res>) =>
  async (req: Req, res: Res, next: NextFunction) => {
    try {
      const errors = validationErrors(req);

      if (!errors.isEmpty()) {
        return next(new ClientErrorBadRequest(validationErrorMapper(errors.array())));
      }

      return await insecureHandler(req, res, next);
    } catch (err) {
      return next(err instanceof Error ? errorMapper(err) : new ServerErrorInternalServerError());
    }
  };

type Middleware = Handler | ValidationChain | ValidationChain[];

const isValidationChain = <Req extends Request, Res extends Response>(
  h: Middleware | Controller<Req, Res>,
): h is ValidationChain | ValidationChain[] => {
  return Array.isArray(h) || (h as ValidationChain).builder !== undefined;
};

const methodFactory =
  (method: Method) =>
  <Req extends Request, Res extends Response>(
    router: Router,
    path: string,
    ...handlers: [...Middleware[], Controller<Req, Res>]
  ) => {
    router[method](
      path,
      ...(handlers as Handler[]).map((m) => (isValidationChain(m) ? m : secureHandler(m))),
    );
  };

export const getRoute = methodFactory(Method.GET);
export const postRoute = methodFactory(Method.POST);
export const putRoute = methodFactory(Method.PUT);
export const patchRoute = methodFactory(Method.PATCH);
export const deleteRoute = methodFactory(Method.DELETE);
export const optionsRoute = methodFactory(Method.OPTIONS);
export const headRoute = methodFactory(Method.HEAD);
