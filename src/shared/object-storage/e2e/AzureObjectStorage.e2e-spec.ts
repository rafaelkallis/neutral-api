import { AzureObjectStorage } from 'shared/object-storage/infrastructure/AzureObjectStorage';
import ObjectID from 'bson-objectid';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { Config } from 'shared/config/application/Config';
import { EnvalidConfig } from 'shared/config/infrastructure/EnvalidConfig';
import { ObjectNotFoundException } from 'shared/object-storage/application/exceptions/ObjectNotFoundException';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { TempFileFactory } from 'shared/utility/application/TempFileFactory';

describe(AzureObjectStorage.name, () => {
  let scenario: UnitTestScenario<AzureObjectStorage>;
  let azureObjectStorage: AzureObjectStorage;
  let key: string;
  const containerName = '_tests';

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(AzureObjectStorage)
      .addProviderFor(Config, EnvalidConfig)
      .addProvider(TempFileFactory)
      .build();
    azureObjectStorage = scenario.subject;
    await scenario.module.init();
    key = new ObjectID().toHexString();
  });

  test('put', async () => {
    const localContent = key;
    const localContentType = 'application/text';
    const localFile = createFakeFile(localContent);
    await azureObjectStorage.put({
      containerName,
      key,
      file: localFile,
      contentType: localContentType,
    });
    const {
      file: remoteFile,
      contentType: remoteContentType,
    } = await azureObjectStorage.get({
      key,
      containerName,
    });
    const remoteContent = fs.readFileSync(remoteFile).toString();
    expect(remoteContent).toEqual(localContent);
    expect(remoteContentType).toEqual(localContentType);
  });

  test('get', async () => {
    const localContent = key;
    const localContentType = 'application/text';
    const localFile = createFakeFile(localContent);
    await azureObjectStorage.put({
      containerName,
      key,
      file: localFile,
      contentType: localContentType,
    });
    const {
      file: remoteFile,
      contentType: remoteContentType,
    } = await azureObjectStorage.get({
      key,
      containerName,
    });
    const remoteContent = fs.readFileSync(remoteFile).toString();
    expect(remoteContent).toEqual(localContent);
    expect(remoteContentType).toEqual(localContentType);
  });

  test('delete', async () => {
    const localContentType = 'application/text';
    const localFile = createFakeFile('');
    await azureObjectStorage.put({
      containerName,
      key,
      file: localFile,
      contentType: localContentType,
    });
    await azureObjectStorage.delete({
      containerName,
      key,
    });
    await expect(
      azureObjectStorage.get({
        key,
        containerName,
      }),
    ).rejects.toThrow(expect.any(ObjectNotFoundException));
  });
});

function createFakeFile(content: string): string {
  const filename = new ObjectID().toHexString() + '.tmp';
  const filepath = path.join(os.tmpdir(), filename);
  fs.writeFileSync(filepath, content);
  return filepath;
}
