import { NextFunction, Request, Response } from 'express';

import { isDev } from '../../helpers/env.js';
import {
  BaseHttpException,
  ClientErrorBadRequest,
  ServerErrorInternalServerError,
} from '../../helpers/httpError.js';

export default (error: Error, _req: Request, res: Response, next: NextFunction): void => {
  if (res.headersSent) {
    next(error);
  }

  if (error instanceof BaseHttpException) {
    if (isDev && error instanceof ServerErrorInternalServerError) {
      console.log(error.meta?.stack);
    }

    res.status(error.statusCode);

    if (error instanceof ClientErrorBadRequest) {
      res.json(error.meta);
    } else {
      res.send(error.message);
    }
  } else {
    if (isDev) {
      console.error(error);
    }
    res.status(500).send('Internal Server Error');
  }
};
