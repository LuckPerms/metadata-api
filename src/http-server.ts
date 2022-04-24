import express from 'express';
import http from 'http';

export class HttpServer {
  port: any;
  server: http.Server;

  constructor(app: express.Express) {
    this.port = HttpServer.normalizePort(process.env.PORT || '3000');
    app.set('port', this.port);

    this.server = http.createServer(app);
    this.server.on('listening', this.onListening.bind(this));
    this.server.on('error', this.onError.bind(this));

    HttpServer.registerShutdownHooks(this.server);

    this.server.listen(this.port);
  }

  onListening() {
    const addr = this.server.address();
    const bind =
      typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;
    console.log('Listening on ' + bind);
  }

  onError(error: any) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind =
      typeof this.port === 'string' ? 'Pipe ' + this.port : 'Port ' + this.port;

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

  static registerShutdownHooks(server: http.Server) {
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

  static normalizePort(val: string) {
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
}
