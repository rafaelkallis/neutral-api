import { AzureObjectStorageService } from 'object-storage/infrastructure/AzureObjectStorageService';
import ObjectID from 'bson-objectid';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { Test } from '@nestjs/testing';
import { CONFIG } from 'config/application/Config';
import { EnvalidConfigService } from 'config/infrastructure/EnvalidConfigService';

describe('azure object storage', () => {
  let azureObjectStorage: AzureObjectStorageService;
  let key: string;
  const containerName = '.tests';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: CONFIG,
          useClass: EnvalidConfigService,
        },

        AzureObjectStorageService,
      ],
    }).compile();
    azureObjectStorage = module.get(AzureObjectStorageService);
    await module.init();
    key = new ObjectID().toHexString();
  });

  test('put file', async () => {
    const localContent = key;
    const localFile = createFakeFile(localContent);
    await azureObjectStorage.putFile(key, localFile, containerName);
    const stream = await azureObjectStorage.getStream(key, containerName);
    const remoteContent = await streamToString(stream);
    expect(remoteContent).toEqual(localContent);
  });

  test('put stream', async () => {
    const localContent = key;
    await azureObjectStorage.putStream(
      key,
      stringToStream(localContent),
      containerName,
    );
    const stream = await azureObjectStorage.getStream(key, containerName);
    const remoteContent = await streamToString(stream);
    expect(remoteContent).toEqual(localContent);
  });

  test('get file', async () => {
    const localContent = key;
    await azureObjectStorage.putStream(
      key,
      stringToStream(localContent),
      containerName,
    );
    const remoteFile = await azureObjectStorage.getFile(key, containerName);
    const remoteStream = fs.createReadStream(remoteFile);
    const remoteContent = await streamToString(remoteStream);
    expect(remoteContent).toEqual(localContent);
  });

  test('get stream', async () => {
    const localContent = key;
    await azureObjectStorage.putStream(
      key,
      stringToStream(localContent),
      containerName,
    );
    const stream = await azureObjectStorage.getStream(key, containerName);
    const remoteContent = await streamToString(stream);
    expect(remoteContent).toEqual(localContent);
  });
});

function createFakeFile(content: string): string {
  const filename = new ObjectID().toHexString() + '.tmp';
  const filepath = path.join(os.tmpdir(), filename);
  fs.writeFileSync(filepath, content);
  return filepath;
}

async function streamToString(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  await new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve());
    stream.on('error', error => reject(error));
  });
  return Buffer.concat(chunks).toString();
}

function stringToStream(content: string): Readable {
  const stream = new Readable();
  stream.push(content);
  stream.push(null);
  return stream;
}
