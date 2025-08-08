import { NextFunction, Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import errorHandler from './errorHandler.js';

// Define an initial mock for runsInDevelopmentMode
vi.mock('@slangy/config/mode.js', () => ({
  runsInDevelopmentMode: true,
}));

describe('errorHandler middleware', () => {
  let req;
  let res;
  let next;
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    req = {
      accepts: vi.fn().mockReturnValue('json'),
    } as unknown as Request;

    res = {
      headersSent: false,
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as Response;

    next = vi.fn() as unknown as NextFunction;

    // Reset the module mock state
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should handle error with status code and message', () => {
    const error = new Error('Test error');
    error['status'] = 400;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Test error' });
    expect(res.send).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle error with default status code and message', () => {
    const error = new Error('Test error');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Test error' });
    expect(res.send).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should send plain text message if JSON is not accepted', () => {
    req.accepts = vi.fn().mockReturnValue(false);
    const error = new Error('Test error');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Test error');
    expect(res.json).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if headers are already sent', () => {
    res.headersSent = true;
    const error = new Error('Test error');

    errorHandler(error, req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should log error details in development mode', async () => {
    const error = new Error('Test error');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(error, req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith('Error: ', error);
  });

  it('should not log error details in production mode', async () => {
    vi.doMock('@slangy/config/mode.js', () => ({
      runsInDevelopmentMode: false,
    }));

    // Re-import the module to apply the new mock
    const { default: errorHandler } = await import('./errorHandler.js');

    const error = new Error('Test error');

    errorHandler(error, req, res, next);

    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
