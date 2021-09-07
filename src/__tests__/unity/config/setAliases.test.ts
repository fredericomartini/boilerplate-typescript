import * as setAliases from '@config/setAliases';
import * as sinon from 'sinon';

const { getPathByType, getTypeByEnv } = setAliases;
const sandbox = sinon.createSandbox();

beforeEach(async () => {
  sandbox.restore();
});

describe('Tests for setAliases functions', () => {
  describe('getTypeByEnv()', () => {
    describe('When env === "local"', () => {
      test('Should return "ts"', async () => {
        expect(getTypeByEnv('local')).toBe('ts');
      });
    });

    describe('When env !== "local"', () => {
      test('Should return "js"', async () => {
        expect(getTypeByEnv('develop')).toBe('js');
        expect(getTypeByEnv('homolog')).toBe('js');
        expect(getTypeByEnv('beta')).toBe('js');
        expect(getTypeByEnv('production')).toBe('js');
        expect(getTypeByEnv('')).toBe('js');
      });
    });
  });

  describe('getPathByType()', () => {
    describe('When type === "ts"', () => {
      test('Should return "src"', async () => {
        expect(getPathByType('ts')).toBe('src');
      });
    });

    describe('When type !== "js"', () => {
      test('Should return dist', async () => {
        expect(getPathByType('js')).toBe('dist');
      });
    });
  });

  describe('setAliases()', () => {
    test('Should call getPathByType()', async () => {
      const spy = jest.spyOn(setAliases, 'getPathByType');

      setAliases.setAliases();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('Should call getTypeByEnv()', async () => {
      const spy = jest.spyOn(setAliases, 'getTypeByEnv');

      setAliases.setAliases();

      expect(spy).toHaveBeenCalledTimes(1);
    });
    test('Should call getTypeByEnv() with "process.env.NODE_ENV', async () => {
      const spy = jest.spyOn(setAliases, 'getTypeByEnv');

      sandbox.stub(process.env, 'NODE_ENV').value('develop');

      setAliases.setAliases();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('develop');

      sandbox.stub(process.env, 'NODE_ENV').value('homolog');
      setAliases.setAliases();
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith('homolog');
    });
  });
});
