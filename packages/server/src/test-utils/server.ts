import { ServerErrorStatusCode } from '@slangy/common/http/statusCode.js';
import express from 'express';
import supertest from 'supertest';

import { Router } from '../helpers/express/router.js';

export default (router: Router) => {
  const app = express();

  app.use(express.json());
  app.use('/', router.getExpressRouter());
  app.use('*', (_, res) => {
    res.sendStatus(ServerErrorStatusCode.ServerErrorNotImplemented);
  });

  return supertest(app);
};
