import { Router as ExpressRouter } from 'express';

import { ServerErrorStatusCode } from '../../http.js';

import { Controller, Request, Response } from './controller.js';
import { MethodHandlers, deleteRoute, getRoute, patchRoute, postRoute, putRoute } from './route.js';

const routes = {
  get: getRoute,
  post: postRoute,
  put: putRoute,
  patch: patchRoute,
  delete: deleteRoute,
};

type RouterUse = {
  (path: string, pathRouter: Router): Router;
  (path: string, ...controllers: Controller[]): Router;
  (...controllers: Controller[]): Router;
};

export type Router = {
  [key in keyof typeof routes]: <Req extends Request, Res extends Response>(
    path: string,
    ...handlers: MethodHandlers<Req, Res>
  ) => Router;
} & {
  use: RouterUse;
  getExpressRouter: () => ExpressRouter;
};

type Route = <Req extends Request, Res extends Response>(
  path: string,
  ...handlers: MethodHandlers<Req, Res>
) => Router;

const router = (): Router => {
  const router = ExpressRouter();
  let frozen = false;

  const self: Router = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    use: ((...args: any[]) => {
      if (frozen) {
        throw new Error('Cannot register routes after router has been frozen');
      }
      router.use(
        ...args.map((arg) =>
          typeof arg === 'object' && 'getExpressRouter' in args ? arg.getExpressRouter() : arg,
        ),
      );
      return self;
    }) as RouterUse,
    ...(Object.keys(routes) as (keyof typeof routes)[]).reduce(
      (acc, method) => ({
        ...acc,
        [method]: <Req extends Request, Res extends Response>(
          path: string,
          ...handlers: MethodHandlers<Req, Res>
        ) => {
          if (frozen) {
            throw new Error('Cannot register routes after router has been frozen');
          }
          routes[method](router, path, ...handlers);
          return self;
        },
      }),
      {} as Record<keyof typeof routes, Route>,
    ),
    getExpressRouter: () => {
      if (!frozen) {
        router.use('*', (_, res) => {
          res.sendStatus(ServerErrorStatusCode.ServerErrorNotImplemented);
        });
        frozen = true;
      }
      return router;
    },
  };

  return self;
};

export default router;
