import 'dotenv/config';
import { HttpServer } from './http-server';
import { MetadataApiApp } from './metadata-api-app';

const app = new MetadataApiApp();
new HttpServer(app.express);
