import logger from '../logger';
import * as socketIO from 'socket.io';

let io: SocketIO.Server;

export function init(app) {
  if (io) return; // Only init once
  io = socketIO(app);
  io.on('connection', function(socket) {
    logger.debug('Socket connected');
  });
}

export {io};
