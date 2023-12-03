import { Socket } from 'socket.io';

import jwtAuth, { defaultRequestJwtUserProperty } from '../../express/auth/jwt.js';
import wrap from '../wrap.js';

const jwtAuthSocket = ({
  requestProperty = defaultRequestJwtUserProperty,
  mandatory = true,
} = {}): ((socket: Socket, next: (err?: Error) => void) => void) =>
  wrap(
    jwtAuth({
      requestProperty,
      mandatory,
    }),
  );

export default jwtAuthSocket;
