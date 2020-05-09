import { ArchiverArchiveFactory } from 'shared/archive/infrastructure/ArchiverArchiveFactory';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import fs from 'fs';
import path from 'path';
import streamToArray from 'stream-to-array';
import { createDeflate } from 'zlib';
import { ArchiveFactory } from 'shared/archive/application/ArchiveFactory';

describe(ArchiverArchiveFactory.name, () => {
  let scenario: IntegrationTestScenario;
  let archiveFactory: ArchiveFactory;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    archiveFactory = scenario.module.get(ArchiveFactory);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('happy path', async () => {
    const {
      file: zipFile,
    } = await archiveFactory
      .createArchiveBuilder()
      .addString('file1.txt', 'some test content')
      .addFile('file2.txt', path.join(__dirname, 'test-file.txt'))
      .build();
    const zipReadable = fs.createReadStream(zipFile).pipe(createDeflate());
    const zipChunks = await streamToArray(zipReadable);
    const zipBuf = Buffer.concat(zipChunks);
    const zipStr = zipBuf.toString('hex');

    const oracleFile = path.join(__dirname, 'test-oracle.zip');
    const oracleZipReadable = fs
      .createReadStream(oracleFile)
      .pipe(createDeflate());
    const oracleZipChunks = await streamToArray(oracleZipReadable);
    const oracleZipBuf = Buffer.concat(oracleZipChunks);
    const oracleZipStr = oracleZipBuf.toString('hex');

    // timestapms are added during archive creation which make output "non-deterministic", don't know if there is a better way to check
    // expect(zipStr).toEqual(oracleZipStr);
    expect(zipStr.length).toEqual(oracleZipStr.length);
  });
});
