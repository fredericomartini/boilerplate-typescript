// import * as cors from 'cors';
import * as express from 'express';

import * as startMonitoring from '@config/monitoring';
import errorHandler from '@middlewares/errorHandler';
import * as logger from '@helpers/logger';

import SetupServer from '../../server';

describe('Server tests', () => {
  jest.spyOn(logger, 'logInfo').mockImplementation();

  describe('Construct', () => {
    test('Should define port', () => {
      const setupServer = new SetupServer(3001);

      expect(setupServer.port).toEqual(3001);
    });
  });

  describe('Init()', () => {
    let setupServer: SetupServer;
    let setupServerProto: any;

    beforeEach(() => {
      setupServer = new SetupServer();
      setupServerProto = Object.getPrototypeOf(setupServer);
    });

    test('Should call startMonitoring()', () => {
      const spy = jest.spyOn(startMonitoring, 'default');

      setupServer.init();

      expect(spy).toHaveBeenCalled();
    });

    test('Should call setupControllers()', () => {
      const spy = jest.spyOn(setupServerProto, 'setupControllers');

      setupServer.init();

      expect(spy).toHaveBeenCalled();
    });

    test('Should call setupExpress()', () => {
      const spy = jest.spyOn(setupServerProto, 'setupExpress');

      setupServer.init();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('setupControllers()', () => {
    test('Should call this.addControllers()', () => {
      const setupServer = new SetupServer();
      const spy = jest.spyOn(setupServer, 'addControllers');

      setupServer.init();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('setupExpress()', () => {
    let setupServer: SetupServer;
    let app: express.Application;
    let spyAppUse: jest.SpyInstance;

    beforeEach(() => {
      setupServer = new SetupServer();
      app = setupServer.getApp();
      spyAppUse = jest.spyOn(app, 'use');
    });

    test('Should call app.use with errorHandler()', () => {
      setupServer.init();

      expect(spyAppUse).toHaveBeenCalledWith(errorHandler);
    });
  });

  describe('getApp()', () => {
    test('Should return a express.Application', () => {
      const setupServer = new SetupServer();

      const app = setupServer.getApp();

      expect(app).toBeDefined();
    });
  });

  describe('listen()', () => {
    test('Should call app.listen() with defined port', () => {
      const setupServer = new SetupServer(3001);
      const app = setupServer.getApp();
      const spy = jest.spyOn(app, 'listen').mockImplementation();

      setupServer.listen();

      expect(spy).toHaveBeenNthCalledWith(1, 3001, expect.any(Function));
    });
  });
});
