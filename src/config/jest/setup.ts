import * as supertest from 'supertest';
import { SetupServer } from '../../server';

/* eslint-disable import/no-extraneous-dependencies */
import 'jest-extended';

let server: SetupServer;

beforeAll(async () => {
  server = new SetupServer();
  await server.init();
  global.request = supertest(server.getApp());
});

beforeEach(async () => {
  jest.resetAllMocks();
  jest.clearAllMocks();
  jest.restoreAllMocks();
});
