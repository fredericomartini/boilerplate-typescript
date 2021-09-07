import { support } from 'fluent-logger';
import * as fluent from '@config/monitoring/logger/transports/fluent';
import * as sinon from 'sinon';

const { getConfig } = fluent;

const sandbox = sinon.createSandbox();

beforeEach(() => {
  sandbox.restore();
});

describe('fluent tests', () => {
  describe('TAG', () => {
    test('Should be defined', () => {
      expect(fluent.TAG).toBeDefined();
    });

    test('Should be NODE_ENV.backend.REPO_NAME', () => {
      expect(fluent.TAG).toBe(`${process.env.NODE_ENV}.backend.${process.env.REPO_NAME}`);
    });
  });

  describe('getConfig()', () => {
    describe('When process.env.FLUENT === true', () => {
      describe('Should return valid config', () => {
        test('When vars are defined', () => {
          sandbox.stub(process, 'env').value({
            FLUENT: 'true',
            FLUENT_PORT: 'port',
            FLUENT_HOST: 'host'
          });

          expect(getConfig()).toContainAllKeys(['host', 'port', 'timeout']);
        });
      });

      describe('Should throw', () => {
        test('When FLUENT_HOST not defined', () => {
          sandbox.stub(process, 'env').value({
            FLUENT: 'true',
            FLUENT_PORT: 'port'
          });

          expect(() => getConfig()).toThrowError();
        });

        test('When FLUENT_PORT not defined', () => {
          sandbox.stub(process, 'env').value({
            FLUENT: 'true',
            FLUENT_HOST: 'host'
          });

          expect(() => getConfig()).toThrowError();
        });
      });
    });

    describe('When process.env.FLUENT !== true', () => {
      describe('Should return empty object {}', () => {
        test('When FLUENT === EMPTY STRING', () => {
          sandbox.stub(process, 'env').value({ FLUENT: '' });
          expect(getConfig()).toEqual({});
        });

        test('When FLUENT === NUMBER', () => {
          sandbox.stub(process, 'env').value({ FLUENT: 123 });
          expect(getConfig()).toEqual({});
        });

        test('When FLUENT === false', () => {
          sandbox.stub(process, 'env').value({ FLUENT: false });
          expect(getConfig()).toEqual({});
        });

        test('When FLUENT === undefined', () => {
          sandbox.stub(process, 'env').value({ FLUENT: undefined });
          expect(getConfig()).toEqual({});
        });
      });
    });
  });

  describe('FluentTransport', () => {
    test('Should call support.winstonTransport()', () => {
      const spy = jest.spyOn(support, 'winstonTransport');

      fluent.default();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
