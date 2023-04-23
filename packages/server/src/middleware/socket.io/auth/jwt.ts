import { Socket } from 'socket.io';

import jwtAuth, { defaultProperty } from '../../express/auth/jwt.js';
import wrap from '../wrap.js';

const jwtAuthSocket = ({ requestProperty = defaultProperty, mandatory = true } = {}): ((
  socket: Socket,
  next: (err?: Error) => void,
) => void) =>
  wrap(
    jwtAuth({
      requestProperty,
      mandatory,
    }),
  );

export default jwtAuthSocket;
