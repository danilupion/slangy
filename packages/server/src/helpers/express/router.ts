import { Router as ExpressRouter } from 'express';

import { ServerErrorStatusCode } from '../../http.js';

import { Request, Response } from './controller.js';
import { MethodHandlers, deleteRoute, getRoute, patchRoute, postRoute, putRoute } from './route.js';

const routes = {
  get: getRoute,
  post: postRoute,
  put: putRoute,
  patch: patchRoute,
  delete: deleteRoute,
};

export type Router = {
  [key in keyof typeof routes]: <Req extends Request, Res extends Response>(
    path: string,
    ...handlers: MethodHandlers<Req, Res>
  ) => Router;
} & {
  use: (path: string, pathRouter: Router) => Router;
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
    use: (path: string, pathRouter: Router) => {
      if (frozen) {
        throw new Error('Cannot register routes after router has been frozen');
      }
      router.use(path, pathRouter.getExpressRouter());
      return self;
    },
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
