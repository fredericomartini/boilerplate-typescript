/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
import * as refParser from 'json-schema-ref-parser';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';

export const PUBLIC_PATH = 'public/docs';
export const ORIG_FILE_PATH = `${PUBLIC_PATH}/redoc/index.yml`;
export const DEST_FILE_PATH = `${PUBLIC_PATH}/doc.yml`;
export const REPLACES = {
  APP_NAME: process.env.APP_NAME,
  HOST_NAME: process.env.HOST_NAME
};

export const replaceVars = (data: refParser.JSONSchema, replaces: object) => {
  try {
    const template = Handlebars.compile(JSON.stringify(data));

    return JSON.parse(template(replaces));
  } catch (error) {
    console.error('Opps.. erro ao fazer substituição de variáveis');
    throw error;
  }
};

/* eslint-disable no-console */
export const getSchemaObject = async (pathFile: string) => {
  let data;

  try {
    data = await refParser.dereference(pathFile);
  } catch (error) {
    console.error('Opps.. erro ao fazer parse dos arquivos .yml');
    throw error;
  }

  return replaceVars(data, REPLACES);
};

/**
 * Faz merge de todos arquivos da documentação em um único arquivo "doc.yml"
 * @param origFilePath
 * @param destFilePath
 */
export const generateDocs = async (origFilePath: string, destFilePath: string) => {
  const schema = await getSchemaObject(origFilePath);

  try {
    fs.writeFileSync(destFilePath, yaml.safeDump(schema));
  } catch (error) {
    console.error('Opps.. erro ao gerar documentação');
    throw error;
  }
};

generateDocs(ORIG_FILE_PATH, DEST_FILE_PATH);
