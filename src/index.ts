import 'dotenv/config';

import { MetadataHttpServer } from './server';
import http from 'http';

const app = new MetadataHttpServer();

const port = normalizePort(process.env.PORT || '3000');
app.express.set('port', port);

const server = http.createServer(app.express);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

registerShutdownHooks(server);

function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error: any) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;
  console.log('Listening on ' + bind);
}

function registerShutdownHooks(server: http.Server) {
  const signals: Record<string, number> = {
    SIGHUP: 1,
    SIGINT: 2,
    SIGTERM: 15,
  };

  function shutdown(signal: string, value: number) {
    console.log('Shutting down...');
    server.close(() => {
      console.log(`Server stopped by ${signal} with value ${value}`);
      process.exit(128 + value);
    });
  }

  Object.keys(signals).forEach(signal => {
    process.on(signal, () => {
      console.log(`Process received a ${signal} signal`);
      shutdown(signal, signals[signal]);
    });
  });
}
