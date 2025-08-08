import { StatusCodes } from '@slangy/http';
import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { describe, expect, it, vi } from 'vitest';

import secureHandler from './secureHandler.js';

const mockRequest = (body: Record<string, string>) => ({ body }) as Request;
const mockResponse = () => {
  return {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response;
};

describe('secureHandler', () => {
  const validationMiddleware = [
    body('email').isEmail().withMessage('Invalid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ];

  const runValidations = async (req: Request) => {
    for (const validation of validationMiddleware) {
      await validation.run(req);
    }
    return validationResult(req);
  };

  it('should call next with validation errors if validation fails', async () => {
    const req = mockRequest({ email: 'invalid-email', password: '123' });
    const res = mockResponse();
    const next = vi.fn() as unknown as NextFunction;

    // Run validations manually
    await runValidations(req);

    const mockController = vi.fn();

    await secureHandler(mockController)(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Validation failed',
        errors: {
          email: ['Invalid email'],
          password: ['Password must be at least 6 characters long'],
        },
      }),
    );
    expect(mockController).not.toHaveBeenCalled();
  });

  it('should call the controller if validation passes', async () => {
    const req = mockRequest({ email: 'test@example.com', password: '123456' });
    const res = mockResponse();
    const next = vi.fn() as unknown as NextFunction;

    // Run validations manually
    await runValidations(req);

    const mockController = vi.fn();

    await secureHandler(mockController)(req, res, next);

    expect(mockController).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with internal server error if controller throws', async () => {
    const req = mockRequest({ email: 'test@example.com', password: '123456' });
    const res = mockResponse();
    const next = vi.fn() as unknown as NextFunction;

    // Run validations manually
    await runValidations(req);

    const mockController = vi.fn().mockRejectedValue(new Error('Controller error'));

    await secureHandler(mockController)(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Controller error',
      }),
    );
  });
});
