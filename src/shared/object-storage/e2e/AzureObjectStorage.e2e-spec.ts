import { AzureObjectStorage } from 'shared/object-storage/infrastructure/AzureObjectStorage';
import ObjectID from 'bson-objectid';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { Test } from '@nestjs/testing';
import { Config } from 'shared/config/application/Config';
import { EnvalidConfig } from 'shared/config/infrastructure/EnvalidConfig';
import { ObjectNotFoundException } from 'shared/object-storage/application/exceptions/ObjectNotFoundException';

describe('azure object storage', () => {
  let azureObjectStorage: AzureObjectStorage;
  let key: string;
  const containerName = '.tests';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: Config,
          useClass: EnvalidConfig,
        },
        AzureObjectStorage,
      ],
    }).compile();
    azureObjectStorage = module.get(AzureObjectStorage);
    await module.init();
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
