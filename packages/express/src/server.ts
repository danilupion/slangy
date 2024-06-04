import { createServer } from 'node:http';

import config from '@slangy/config';
// import { Router } from './router.js';
import { mode, runsInProductionMode } from '@slangy/config/mode.js';
import chalk from 'chalk';
import express, { json, static as staticMiddleware } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import errorHandler from './middleware/errorHandler.js';
import notFoundHandler from './middleware/notFoundHandler.js';

const app = express();

type ServerOptions = {
  loggerFormat?: string;
  acceptJson?: boolean;
  jsonBodyParserLimits?: string | number;
  staticsPath?: string;
  port?: number;
  // routes?: [string, Router][];
  spaFilePath?: string;
};

const server = async ({
  loggerFormat = runsInProductionMode ? 'common' : 'dev',
  acceptJson,
  jsonBodyParserLimits,
  staticsPath,
  port = config.has('server.port') ? config.get<number>('server.port') : 3000,
  // routes,
  spaFilePath,
}: ServerOptions = {}) => {
  app.use(helmet());
  app.use(morgan(loggerFormat));

  if (acceptJson) {
    // Configure body parser to accept json
    app.use(json(jsonBodyParserLimits ? { limit: jsonBodyParserLimits } : {}));
  }

  if (staticsPath) {
    // Register handler for static assets
    app.use(staticMiddleware(staticsPath));
  }

  // if (routes) {
  //   for (const [path, router] of routes) {
  //     app.use(path, router.getExpressRouter());
  //   }
  // }

  if (spaFilePath) {
    // Catch all routes to serve the SPA
    app.get('*', (_, res) => {
      res.sendFile(spaFilePath);
    });
  }

  // Register custom not found handler
  app.use(notFoundHandler);

  // Register custom error Middleware (should registered the last)
  app.use(errorHandler);

  const httpServer = createServer(app);

  httpServer.listen(port);

  console.log(
    chalk.green(
      `${chalk.bold('[Server::START]')} Running in ${chalk.bold(mode)} mode, listening on port ${chalk.bold(port)}`,
    ),
  );
};

export default server;
