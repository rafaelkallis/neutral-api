import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  ObjectStorage,
  PutReturn,
  GetReturn,
  PutContext,
  GetContext,
} from 'object-storage/application/ObjectStorage';
import { Config, InjectConfig } from 'config/application/Config';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import { ObjectNotFoundException } from 'object-storage/application/exceptions/ObjectNotFoundException';

/**
 * Azure Object Storage Service
 */
@Injectable()
export class AzureObjectStorageService extends ObjectStorage {
  private readonly client: BlobServiceClient;

  public constructor(@InjectConfig() config: Config) {
    super();
    const connectionString = config.get('AZURE_BLOB_STORAGE_CONNECTION_STRING');
    this.client = BlobServiceClient.fromConnectionString(connectionString);
  }

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

  public async get({ containerName, key }: GetContext): Promise<GetReturn> {
    const blob = await this.getBlob(containerName, key);
    const file = super.createTempFile();
    const response = await blob.downloadToFile(file);
    const { errorCode, contentType } = response;
    if (errorCode) {
      throw new ObjectNotFoundException();
    }
    if (!contentType) {
      throw new InternalServerErrorException();
    }
    return { file, contentType };
  }

  private async getBlob(
    containerName: string,
    key: string,
  ): Promise<BlockBlobClient> {
    const container = this.client.getContainerClient(containerName);
    if (!(await container.exists())) {
      await container.create();
    }
    const blob = container.getBlockBlobClient(key);
    return blob;
  }
}
