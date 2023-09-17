import { createServer } from 'http';

import express, { json, static as staticMiddleware } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import errorHandler from '../../middleware/express/errorHandler.js';
import notFoundHandler from '../../middleware/express/notFoundHandler.js';
import { isDev } from '../env.js';

import { Router } from './router.js';

const app = express();

interface ServerOptions {
  loggerFormat?: string;
  devLoggerFormat?: string;
  acceptJson?: boolean;
  jsonBodyParserLimits?: string | number;
  staticsPath?: string;
  port?: number;
  routes?: [string, Router][];
  spaFilePath?: string;
  init?: () => Promise<void>;
}

const server = async ({
  devLoggerFormat = 'dev',
  loggerFormat = 'common',
  acceptJson,
  jsonBodyParserLimits,
  staticsPath,
  port = 3000,
  routes,
  spaFilePath,
  init,
}: ServerOptions = {}) => {
  // Configure some security headers
  if (isDev) {
    app.use(helmet({ contentSecurityPolicy: false }));
    // Register HTTP request logger
    app.use(morgan(devLoggerFormat));
  } else {
    app.use(helmet());
    // Register HTTP request logger
    app.use(morgan(loggerFormat));
  }

  if (acceptJson) {
    // Configure body parser to accept json
    app.use(json(jsonBodyParserLimits ? { limit: jsonBodyParserLimits } : {}));
  }

  if (staticsPath) {
    // Register handler for static assets
    app.use(staticMiddleware(staticsPath));
  }

  if (routes) {
    for (const [path, router] of routes) {
      app.use(path, router.getExpressRouter());
    }
  }

  if (spaFilePath) {
    // Catch all routes to serve the SPA
    app.get('*', (_, res) => {
      res.sendFile(spaFilePath);
    });
  }

  // Register custom not found handler
  app.use(notFoundHandler);

  // Register custom error handler (should registered the last)
  app.use(errorHandler);

  const httpServer = createServer(app);

  if (init) {
    await init();
  }
  httpServer.listen(port);
  console.error(`Listening in port ${port} ${isDev ? 'in DEV mode' : 'in PROD mode'}`);
};

export default server;
