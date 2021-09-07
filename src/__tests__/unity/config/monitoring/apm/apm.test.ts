import * as ElasticAPM from 'elastic-apm-node';

import apm from '@config/monitoring/apm';

import { createSandbox } from 'sinon';

const sandbox = createSandbox();

beforeEach(() => {
  sandbox.restore();
});

describe('APM Tests', () => {
  describe('When process.env.TESTING !== true', () => {
    test('Should start APM with valid params', () => {
      const params = {
        TESTING: 'false',
        REPO_NAME: 'my-repo',
        APM_SERVICE_URL: 'http://test.com',
        NODE_ENV: 'testing'
      };

      sandbox.stub(process, 'env').value(params);
      const spy = jest.spyOn(ElasticAPM, 'start').mockImplementation();

      apm();
      expect(spy).toHaveBeenNthCalledWith(1, {
        serviceName: params.REPO_NAME,
        serverUrl: params.APM_SERVICE_URL,
        environment: params.NODE_ENV,
        captureExceptions: true
      });
    });
  });

  describe('When process.env.TESTING === true', () => {
    test('Should NOT start APM', () => {
      sandbox.stub(process.env, 'TESTING').value('true');
      const spy = jest.spyOn(ElasticAPM, 'start');

      apm();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
