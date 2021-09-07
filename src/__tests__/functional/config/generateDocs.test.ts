import * as fs from 'fs';
import * as util from 'util';
import { exec as Exec } from 'child_process';
import { DEST_FILE_PATH, generateDocs, ORIG_FILE_PATH } from '@config/generateDocs';

const exec = util.promisify(Exec);

describe('generateDocs()', () => {
  beforeEach(() => {
    // Remove doc.yml
    try {
      fs.unlinkSync(DEST_FILE_PATH);
    } catch (error) {
      //
    }
  });

  test('Should generate doc.yml on "public/docs/" when script executed', async () => {
    expect(fs.existsSync(DEST_FILE_PATH)).toBeFalse();

    await generateDocs(ORIG_FILE_PATH, DEST_FILE_PATH);

    expect(fs.existsSync(DEST_FILE_PATH)).toBeTrue();
  });

  test('Should exec generateDocs when: "npm run generate-docs"', async () => {
    expect(fs.existsSync(DEST_FILE_PATH)).toBeFalse();

    await exec('npm run generate-docs');

    expect(fs.existsSync(DEST_FILE_PATH)).toBeTrue();
  });
});
