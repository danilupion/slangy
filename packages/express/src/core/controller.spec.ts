import { NextFunction, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { describe, expect, it, Mock, vi } from 'vitest';

import { Controller } from './controller';

type MockRequest = ExpressRequest;
type MockResponse = ExpressResponse & { send: Mock };

describe('controller', () => {
  const mockReq = {} as MockRequest;
  const mockRes = { send: vi.fn() } as unknown as MockResponse;
  const mockNext: NextFunction = vi.fn() as unknown as NextFunction;

  it('should allow a controller to be defined and called', async () => {
    const controller: Controller<typeof mockReq, typeof mockRes> = async (req, res) => {
      res.send({ message: 'test' });
    };

    await controller(mockReq, mockRes, mockNext);
    expect(mockRes.send).toHaveBeenCalledWith({ message: 'test' });
  });
});
