import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { ObjectStorage } from 'object-storage/application/ObjectStorage';
import { Readable } from 'stream';
import { Config, InjectConfig } from 'config/application/Config';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { ObjectNotFoundException } from 'object-storage/application/exceptions/ObjectNotFoundException';

/**
 * Azure Object Storage Service
 */
@Injectable()
export class AzureObjectStorageService extends ObjectStorage
  implements OnModuleInit {
  private readonly container: ContainerClient;

  public constructor(@InjectConfig() config: Config) {
    super();
    const connectionString = config.get('AZURE_BLOB_STORAGE_CONNECTION_STRING');
    const containerName = config.get('AZURE_BLOB_STORAGE_CONTAINER_NAME');
    const client = BlobServiceClient.fromConnectionString(connectionString);
    this.container = client.getContainerClient(containerName);
  }

  public async onModuleInit(): Promise<void> {
    // if (!(await this.container.exists())) {
    //   // throw new Error(
    //   //   `given azure blob storage container {${this.container.containerName}} does not exist`,
    //   // );
    //   await this.container.create();
    // }
  }

  public async putFile(key: string, filepath: string): Promise<void> {
    const blockBlob = this.container.getBlockBlobClient(key);
    await blockBlob.uploadFile(filepath);
  }

  public async putStream(key: string, stream: Readable): Promise<void> {
    const blockBlob = this.container.getBlockBlobClient(key);
    await blockBlob.uploadStream(stream);
  }

  public async getFile(key: string): Promise<string> {
    const blockBlob = this.container.getBlockBlobClient(key);
    const tempFilepath = super.createTempFile();
    const response = await blockBlob.downloadToFile(tempFilepath);
    if (response.errorCode) {
      throw new ObjectNotFoundException();
    }
    return tempFilepath;
  }

  public async getStream(key: string): Promise<Readable> {
    const blockBlob = this.container.getBlockBlobClient(key);
    const response = await blockBlob.download();
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
}
