import { ServerErrorStatusCode } from '@danilupion/turbo-common/http/statusCode.js';
import express, { Router } from 'express';
import supertest from 'supertest';

export default (router: Router) => {
  const app = express();

  app.use(express.json());
  app.use('/', router);
  app.use('*', (_, res) => {
    res.sendStatus(ServerErrorStatusCode.ServerErrorNotImplemented);
  });

  return supertest(app);
};
