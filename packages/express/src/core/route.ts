import { Methods } from '@slangy/http';
import { Handler, Router } from 'express';
import { ValidationChain } from 'express-validator';

import { Controller, Request, Response } from './controller.js';
import secureHandler from './secureHandler.js';

type Middleware = Handler | ValidationChain | ValidationChain[];

const isValidationChain = <Req extends Request, Res extends Response>(
  h: Middleware | Controller<Req, Res>,
): h is ValidationChain | ValidationChain[] => {
  return (
    Array.isArray(h) ||
    ((h as ValidationChain).builder !== undefined && 'run' in h && typeof h.run === 'function')
  );
};

export type MethodHandlers<Req extends Request, Res extends Response> = [
  ...Middleware[],
  Controller<Req, Res>,
];

const methodFactory =
  (method: Methods) =>
  <Req extends Request, Res extends Response>(
    router: Router,
    path: string,
    ...handlers: MethodHandlers<Req, Res>
  ) => {
    router[method](
      path,
      ...(handlers as Handler[]).map((m) => (isValidationChain(m) ? m : secureHandler(m))),
    );
  };

export const getRoute = methodFactory(Methods.GET);
export const postRoute = methodFactory(Methods.POST);
export const putRoute = methodFactory(Methods.PUT);
export const patchRoute = methodFactory(Methods.PATCH);
export const deleteRoute = methodFactory(Methods.DELETE);
export const optionsRoute = methodFactory(Methods.OPTIONS);
export const headRoute = methodFactory(Methods.HEAD);
