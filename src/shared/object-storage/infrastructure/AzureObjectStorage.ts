import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  ObjectStorage,
  PutReturn,
  GetReturn,
  PutContext,
  GetContext,
  DeleteContext,
} from 'shared/object-storage/application/ObjectStorage';
import { Config } from 'shared/config/application/Config';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import { ObjectNotFoundException } from 'shared/object-storage/application/exceptions/ObjectNotFoundException';
import { TelemetryAction } from 'shared/telemetry/application/TelemetryAction';
import { TempFileFactory } from 'shared/utility/application/TempFileFactory';

/**
 * Azure Object Storage Service
 */
@Injectable()
export class AzureObjectStorage extends ObjectStorage {
  private readonly client: BlobServiceClient;
  private readonly tempFileFactory: TempFileFactory;

  public constructor(config: Config, tempFileFactory: TempFileFactory) {
    super();
    const connectionString = config.get('AZURE_BLOB_STORAGE_CONNECTION_STRING');
    this.client = BlobServiceClient.fromConnectionString(connectionString);
    this.tempFileFactory = tempFileFactory;
  }

  @TelemetryAction.register()
  public async put({
    containerName,
    file,
    contentType,
    key,
  }: PutContext): Promise<PutReturn> {
    key = key || this.createKey();
    const blob = await this.getBlob(containerName, key);
    await blob.uploadFile(file, {
      blobHTTPHeaders: { blobContentType: contentType },
    });
    return { key };
  }

  @TelemetryAction.register()
  public async get({ containerName, key }: GetContext): Promise<GetReturn> {
    const blob = await this.getBlob(containerName, key);
    const file = this.tempFileFactory.createTempFile();
    let response;
    try {
      response = await blob.downloadToFile(file.path);
    } catch (error) {
      if (error?.details?.errorCode === 'BlobNotFound') {
        throw new ObjectNotFoundException();
      }
      throw error;
    }
    const { contentType } = response;
    if (!contentType) {
      throw new InternalServerErrorException();
    }
    return { file: file.path, contentType };
  }

  public async delete({ containerName, key }: DeleteContext): Promise<void> {
    const blob = await this.getBlob(containerName, key);
    try {
      await blob.delete();
    } catch (error) {
      if (error?.details?.errorCode === 'BlobNotFound') {
        throw new ObjectNotFoundException();
      }
      throw error;
    }
  }

  private async getBlob(
    containerName: string,
    key: string,
  ): Promise<BlockBlobClient> {
    console.log(1, containerName);
    const container = this.client.getContainerClient(containerName);
    console.log(2, container);
    try {
      await container.createIfNotExists();
    } catch (err) {
      console.error(err);
      throw err;
    }
    console.log(3);
    const blob = container.getBlockBlobClient(key);
    return blob;
  }
}
