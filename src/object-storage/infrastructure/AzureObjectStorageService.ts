import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ObjectStorage } from 'object-storage/application/ObjectStorage';
import { Readable } from 'stream';
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

  public async putFile(
    key: string,
    filepath: string,
    containerName?: string,
  ): Promise<void> {
    const blob = await this.getBlob(key, containerName);
    await blob.uploadFile(filepath);
  }

  public async putStream(
    key: string,
    stream: Readable,
    containerName?: string,
  ): Promise<void> {
    const blob = await this.getBlob(key, containerName);
    await blob.uploadStream(stream);
  }

  public async getFile(key: string, containerName?: string): Promise<string> {
    const blob = await this.getBlob(key, containerName);
    const tempFilepath = super.createTempFile();
    const response = await blob.downloadToFile(tempFilepath);
    if (response.errorCode) {
      throw new ObjectNotFoundException();
    }
    return tempFilepath;
  }

  public async getStream(
    key: string,
    containerName?: string,
  ): Promise<Readable> {
    const blob = await this.getBlob(key, containerName);
    const response = await blob.download();
    if (response.errorCode) {
      throw new ObjectNotFoundException();
    }
    // only works with nodejs, and not in browser
    // @see https://docs.microsoft.com/en-us/javascript/api/@azure/storage-blob/blockblobclient?view=azure-node-latest#download-undefined---number--undefined---number--blobdownloadoptions-
    if (!response.readableStreamBody) {
      throw new InternalServerErrorException();
    }
    // TODO: make sure this type cast doesn't cause any runtime issues
    return response.readableStreamBody as Readable;
  }

  private async getBlob(
    key: string,
    containerName: string = this.defaultContainerName(),
  ): Promise<BlockBlobClient> {
    const container = this.client.getContainerClient(containerName);
    if (!(await container.exists())) {
      await container.create();
    }
    const blob = container.getBlockBlobClient(key);
    return blob;
  }
}
