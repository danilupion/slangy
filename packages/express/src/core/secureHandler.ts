import { StatusCodes } from '@slangy/http';
import { NextFunction } from 'express';
import { FieldValidationError, ValidationError, validationResult } from 'express-validator';
import createError, { InternalServerError, isHttpError } from 'http-errors';

import { Controller, Request, Response } from './controller.js';

type MappedValidationError = Record<string, string[]>;

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

const errorNormalizer = (error: ValidationError): CustomValidationError[] => {
  const fieldErrors = extractFieldValidationErrors(error);

  return fieldErrors.map((fieldError) => ({
    field: fieldError.path,
    message: fieldError.msg,
  }));
};

const validationErrors = validationResult.withDefaults({
  formatter: errorNormalizer,
});

const validationErrorMapper = (errors: CustomValidationError[]): MappedValidationError => {
  return errors.reduce((acc, curr) => {
    const currentMessages = acc[curr.field] ?? [];
    return {
      ...acc,
      [curr.field]: currentMessages.includes(curr.message)
        ? currentMessages
        : [...currentMessages, curr.message],
    };
  }, {} as MappedValidationError);
};

const errorMapper = (err: Error) => {
  if (isHttpError(err)) {
    return err;
  }

  return createError(StatusCodes.INTERNAL_SERVER_ERROR, err);
};

const secureHandler =
  <Req extends Request, Res extends Response>(insecureHandler: Controller<Req, Res>) =>
  async (req: Req, res: Res, next: NextFunction) => {
    try {
      const errors = validationErrors(req);

      if (!errors.isEmpty()) {
        const mappedErrors = validationErrorMapper(errors.array().flat());
        return next(
          createError(StatusCodes.BAD_REQUEST, {
            message: 'Validation failed',
            errors: mappedErrors,
          }),
        );
      }

      return await insecureHandler(req, res, next);
    } catch (err) {
      return next(err instanceof Error ? errorMapper(err) : new InternalServerError());
    }
  };

export default secureHandler;
