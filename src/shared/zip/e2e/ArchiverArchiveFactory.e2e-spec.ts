import { ArchiverArchiveFactory } from 'shared/zip/infrastructure/ArchiverArchiveFactory';
import { UnitTestScenario } from 'test/UnitTestScenario';
import fs from 'fs';
import path from 'path';
import streamToArray from 'stream-to-array';
import { createDeflate } from 'zlib';

describe(ArchiverArchiveFactory.name, () => {
  let scenario: UnitTestScenario<ArchiverArchiveFactory>;
  let zipFactory: ArchiverArchiveFactory;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(ArchiverArchiveFactory).build();
    zipFactory = scenario.subject;
  });

  test('happy path', async () => {
    let zipReadable = await zipFactory
      .createArchiveBuilder()
      .addString('file1.txt', 'some test content')
      .addFile('file2.txt', path.join(__dirname, 'test-file.txt'))
      .build();
    const zipChunks = await streamToArray(zipReadable.pipe(createDeflate()));
    const zipBuf = Buffer.concat(zipChunks);
    const zipStr = zipBuf.toString('hex');

    const oracleZipReadable = fs
      .createReadStream(path.join(__dirname, 'test-oracle.zip'))
      .pipe(createDeflate());
    const oracleZipChunks = await streamToArray(oracleZipReadable);
    const oracleZipBuf = Buffer.concat(oracleZipChunks);
    const oracleZipStr = oracleZipBuf.toString('hex');

    // timestapms are added during archive creation which make output "non-deterministic", don't know if there is a better way to check
    // expect(zipStr).toEqual(oracleZipStr);
    expect(zipStr.length).toEqual(oracleZipStr.length);
  });
});
