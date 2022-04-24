import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import prom from 'express-prom-bundle';
import morgan from 'morgan';
import { DataManager } from './data-manager';
import { DataRouter } from './routers/data-router';
import { TranslationRouter } from './routers/translation-router';
import { TranslationManager } from './translation-manager';

export class MetadataApiApp {
  express: express.Express;

  dataManager: DataManager;
  translationManager: TranslationManager;

  dataRouter: DataRouter;
  translationRouter: TranslationRouter;

  constructor() {
    this.express = express();
    this.configure();

    this.dataManager = new DataManager();
    this.translationManager = new TranslationManager(this.dataManager);

    this.dataRouter = new DataRouter(this.dataManager);
    this.translationRouter = new TranslationRouter(this.translationManager);

    this.setupRoutes();
  }

  configure() {
    this.express.use(morgan('dev'));
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(cors());
    this.express.disable('x-powered-by');

    if (process.env.METADATA_API_METRICS) {
      this.express.use(
        '/metrics',
        (req: Request, res: Response, next: NextFunction) => {
          if (req.header('X-Forwarded-For')) {
            res.status(401).send('Unauthorized');
          } else {
            next();
          }
        }
      );
      this.express.use(
        prom({
          includePath: true,
          includeUp: false,
        })
      );
    }
  }

  setupRoutes() {
    this.express.use('/health', this.health);
    this.express.use('/data', this.dataRouter.express);
    this.express.use('/translation', this.translationRouter.express);
  }

  health(req: Request, res: Response) {
    res.status(200).header('Cache-Control', 'no-cache').send({ status: 'ok' });
  }
}
