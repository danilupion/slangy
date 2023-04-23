import { NextFunction, Request, Response, Router } from 'express';

import {
  BaseHttpException,
  ClientErrorBadRequest,
  ServerErrorInternalServerError,
} from '../httpError.js';

type CustomParamHandler<
  Req extends Request = Request,
  Res extends Response = Response,
  Value = string,
> = (req: Req, res: Res, next: NextFunction, value: Value, name: string) => Promise<void> | void;

const paramHandler =
  <Req extends Request = Request, Res extends Response = Response, Value = string>(
    insecureHandler: CustomParamHandler<Req, Res, Value>,
  ) =>
  async (req: Req, res: Res, next: NextFunction, value: Value, name: string) => {
    try {
      return await insecureHandler(req, res, next, value, name);
    } catch (err) {
      if (err instanceof BaseHttpException) {
        return next(err);
      }

      return next(new ServerErrorInternalServerError(err instanceof Error ? err : undefined));
    }
  };

export function param<Req extends Request = Request, Res extends Response = Response>(
  router: Router,
  path: string,
  insecureHandler: CustomParamHandler<Req, Res>,
): void;

export function param<Req extends Request = Request, Res extends Response = Response>(
  router: Router,
  path: string,
  validator: RegExp,
  insecureHandler: CustomParamHandler<Req, Res>,
): void;

export function param<Req extends Request = Request, Res extends Response = Response>(
  router: Router,
  path: string,
  ...rest: [CustomParamHandler<Req, Res>] | [RegExp, CustomParamHandler<Req, Res>]
) {
  if (rest.length === 1) {
    router.param(path, paramHandler(rest[0]) as CustomParamHandler);
  } else {
    router.param(path, (req, res, next, value, name) => {
      if (!value.match(rest[0] as RegExp)) {
        return next(new ClientErrorBadRequest({ [name]: ['Invalid value'] }));
      }

      return paramHandler(rest[1] as CustomParamHandler)(req, res, next, value, name);
    });
  }
}
