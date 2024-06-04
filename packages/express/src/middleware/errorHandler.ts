import { runsInDevelopmentMode } from '@slangy/config/mode.js';
import { NextFunction, Request, Response } from 'express';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (res.headersSent) {
    return next(err);
  }

  // Set default values for error properties
  const status = 'status' in err && typeof err.status === 'number' ? err.status : 500;
  const message = err.message || 'Internal Server Error';

  if (runsInDevelopmentMode) {
    // Log the error details
    console.error('Error: ', err);
  }

  res.status(status);

  if (req.accepts('json')) {
    res.json({
      message,
    });
  } else {
    res.send(message);
  }
};

export default errorHandler;
