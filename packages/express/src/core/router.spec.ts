import express from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import { Controller, Request, Response } from './controller.js';
import router from './router.js';

const createTestApp = () => {
  const app = express();
  const testRouter = router();

  const sampleGetController: Controller<Request, Response<string>> = (req, res) => {
    res.status(200).send('GET request successful');
  };

  const samplePostController: Controller<Request, Response<string>> = (req, res) => {
    res.status(201).send('POST request successful');
  };

  const samplePutController: Controller<Request, Response<string>> = (req, res) => {
    res.status(200).send('PUT request successful');
  };

  const samplePatchController: Controller<Request, Response<string>> = (req, res) => {
    res.status(200).send('PATCH request successful');
  };

  const sampleDeleteController: Controller<Request, Response<string>> = (req, res) => {
    res.status(204).send();
  };

  testRouter.get('/test-get', sampleGetController);
  testRouter.post('/test-post', samplePostController);
  testRouter.put('/test-put', samplePutController);
  testRouter.patch('/test-patch', samplePatchController);
  testRouter.delete('/test-delete', sampleDeleteController);

  app.use(testRouter.getExpressRouter());
  return app;
};

describe('Router tests', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeAll(() => {
    app = createTestApp();
  });

  it('GET /test-get should return 200', async () => {
    const response = await request(app).get('/test-get');
    expect(response.status).toBe(200);
    expect(response.text).toBe('GET request successful');
  });

  it('POST /test-post should return 201', async () => {
    const response = await request(app).post('/test-post');
    expect(response.status).toBe(201);
    expect(response.text).toBe('POST request successful');
  });

  it('PUT /test-put should return 200', async () => {
    const response = await request(app).put('/test-put');
    expect(response.status).toBe(200);
    expect(response.text).toBe('PUT request successful');
  });

  it('PATCH /test-patch should return 200', async () => {
    const response = await request(app).patch('/test-patch');
    expect(response.status).toBe(200);
    expect(response.text).toBe('PATCH request successful');
  });

  it('DELETE /test-delete should return 204', async () => {
    const response = await request(app).delete('/test-delete');
    expect(response.status).toBe(204);
  });
});
