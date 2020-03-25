import { AzureObjectStorageService } from 'object-storage/infrastructure/AzureObjectStorageService';
import ObjectID from 'bson-objectid';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { Test } from '@nestjs/testing';
import { Config } from 'config/application/Config';
import { EnvalidConfigService } from 'config/infrastructure/EnvalidConfigService';
import { ObjectNotFoundException } from 'object-storage/application/exceptions/ObjectNotFoundException';

describe('azure object storage', () => {
  let azureObjectStorage: AzureObjectStorageService;
  let key: string;
  const containerName = '.tests';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: Config,
          useClass: EnvalidConfigService,
        },
        AzureObjectStorageService,
      ],
    }).compile();
    azureObjectStorage = module.get(AzureObjectStorageService);
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
