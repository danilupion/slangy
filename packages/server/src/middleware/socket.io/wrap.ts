import { Request } from 'express';
import { Socket } from 'socket.io';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Middleware = (request: Request, response: any, next: (err?: any) => void) => void;

export default (middleware: Middleware) => {
  return (socket: Socket, next: (err?: Error) => void) => {
    return middleware(socket.request as Request, {}, next);
  };
};
