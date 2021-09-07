import 'reflect-metadata';
import 'dotenv-safe/config';
import './config/setAliases';

import * as express from 'express';
import { Server } from '@overnightjs/core';

import * as cors from 'cors';
import * as helmet from 'helmet';
import startMonitoring from '@config/monitoring';
import errorHandler from '@middlewares/errorHandler';
import { logInfo } from '@helpers/logger';
import V1 from '@modules/V1/controller';
import rateLimitHandler from '@middlewares/rateLimitHandler';
import Container from 'typedi';

export class SetupServer extends Server {
  readonly port: number;

  constructor(port = 3000) {
    super();

    this.port = port;
  }

  public async init(): Promise<void> {
    startMonitoring();
    this.setupExpress();
  }

  private setupControllers(): void {
    this.addControllers([Container.get(V1)]);
  }

  private setupExpress(): void {
    this.app.use(rateLimitHandler);
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.setupControllers();
    this.app.use(express.static('public'));
    this.app.get(['/status'], (_, res) => res.json({ up: true }));
    this.app.get('/', (_, res) => res.redirect('/docs'));
    this.app.get('/*', async (_, res) => res.status(404).send());
    this.app.use(errorHandler);
  }

  public getApp(): express.Application {
    return this.app;
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      logInfo(`🚀 Server runing on ${process.env.PORT} and ${process.env.NODE_ENV}`);
    });
  }
}

export default SetupServer;
