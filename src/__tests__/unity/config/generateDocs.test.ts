import * as GenerateDocs from '@config/generateDocs';
import * as fs from 'fs';

const {
  ORIG_FILE_PATH, PUBLIC_PATH, DEST_FILE_PATH, REPLACES, replaceVars, getSchemaObject, generateDocs
} = GenerateDocs;

import $RefParser = require('json-schema-ref-parser');

describe('generateDocs tests', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });

  describe('Should have Defined vars', () => {
    describe('PUBLIC_PATH', () => {
      test('Should be public/docs', () => {
        expect(PUBLIC_PATH).toBe('public/docs');
      });
    });

    describe('ORIG_FILE_PATH', () => {
      test('Should be public/docs/redoc/index.yml', () => {
        expect(ORIG_FILE_PATH).toBe('public/docs/redoc/index.yml');
      });
    });

    describe('DEST_FILE_PATH', () => {
      test('Should be public/docs/doc.yml', () => {
        expect(DEST_FILE_PATH).toBe('public/docs/doc.yml');
      });
    });

    describe('REPLACES', () => {
      test('Should have APP_NAME', () => {
        expect(REPLACES).toContainKey('APP_NAME');
      });
      test('Should have HOST_NAME', () => {
        expect(REPLACES).toContainKey('HOST_NAME');
      });
    });

    describe('ENV vars', () => {
      test('APP_NAME', () => {
        expect(process.env.APP_NAME).toBeDefined();
      });

      test('HOST_NAME', () => {
        expect(process.env.HOST_NAME).toBeDefined();
      });
    });
  });

  describe('replaceVars()', () => {
    test('Should replace content with replaces', () => {
      const replaces = { APP_NAME: 'my super app', OTHER_VAR: '' };
      const content = { content: 'My {{ APP_NAME }} is the best {{OTHER_VAR}}' };
      const result = replaceVars(content, replaces);

      expect(result).toBeDefined();
      expect(result).toEqual({ content: 'My my super app is the best ' });
    });

    test('Should throw Error when some error', () => {
      jest.spyOn(JSON, 'stringify').mockImplementation();
      expect(() => replaceVars({}, {})).toThrowError();
    });

    test('Should console.error("Opps.. erro ao fazer substituição de variáveis")', () => {
      jest.spyOn(JSON, 'stringify').mockImplementation();
      const spy = jest.spyOn(console, 'error');

      expect(() => replaceVars({}, {})).toThrowError();
      expect(spy).toHaveBeenNthCalledWith(1, 'Opps.. erro ao fazer substituição de variáveis');
    });
  });

  describe('getSchemaObject()', () => {
    const data = { content: 'my content {{MY_VAR}}' };

    test('Should call dereference() from json-schema-ref-parser with string path', async () => {
      const spy = jest.spyOn($RefParser, 'dereference').mockResolvedValue({});

      await getSchemaObject('my-path');

      expect(spy).toHaveBeenNthCalledWith(1, 'my-path');
    });

    test('Should call replaceVars()', async () => {
      jest.spyOn($RefParser, 'dereference').mockResolvedValue(data);
      const spy = jest.spyOn(GenerateDocs, 'replaceVars');

      await getSchemaObject('my-path');

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('Should replace filepath content with valid data', async () => {
      const validResponse = { content: 'my content ' };

      jest.spyOn($RefParser, 'dereference').mockResolvedValue(data);
      jest.spyOn(GenerateDocs, 'replaceVars').mockResolvedValue(validResponse);
      const response = await getSchemaObject('my-path');

      expect(response).toEqual(validResponse);
    });

    test('Should throw Error when some error', async () => {
      await expect(getSchemaObject('my-path')).rejects.toThrowError();
    });

    test('Should console.error("Opps.. erro ao fazer parse dos arquivos .yml")', async () => {
      await expect(getSchemaObject('my-path')).rejects.toThrowError();
      const spy = jest.spyOn(console, 'error');

      expect(spy).toHaveBeenNthCalledWith(1, 'Opps.. erro ao fazer parse dos arquivos .yml');
    });
  });

  describe('generateDocs()', () => {
    test('Should call getSchemaObject() with string origFilePath', async () => {
      jest.spyOn(fs, 'writeFileSync').mockImplementation();
      const spy = jest.spyOn(GenerateDocs, 'getSchemaObject').mockResolvedValue('');

      await generateDocs('my-path', '');
      expect(spy).toHaveBeenNthCalledWith(1, 'my-path');
    });

    test('Should call writeFileSync() with string destFilePath and yaml object', async () => {
      const origFilePath = 'test.yml';
      const destFilePath = 'test/abc/doc.yml';
      const spy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
      const yaml = {
        test: 'abc'
      };
      const yamlAsString = 'test: abc\n';

      jest.spyOn(GenerateDocs, 'getSchemaObject').mockResolvedValue(yaml);

      await generateDocs(origFilePath, destFilePath);
      expect(spy).toHaveBeenNthCalledWith(1, destFilePath, yamlAsString);
    });

    test('Should console.error("Opps.. erro ao gerar documentação")', async () => {
      jest.spyOn(GenerateDocs, 'getSchemaObject').mockResolvedValue('');
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => { throw new Error('abc'); });
      const spy = jest.spyOn(console, 'error');

      await expect(generateDocs('', '')).rejects.toThrowError();

      expect(spy).toHaveBeenNthCalledWith(1, 'Opps.. erro ao gerar documentação');
    });
  });
});
