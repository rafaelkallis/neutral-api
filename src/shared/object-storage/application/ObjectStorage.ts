import ObjectID from 'bson-objectid';

export interface PutContext {
  containerName: string;
  file: string;
  contentType: string;
  key?: string;
}

export interface PutReturn {
  key: string;
}

export interface GetContext {
  containerName: string;
  key: string;
}

export interface GetReturn {
  file: string;
  contentType: string;
}

export interface DeleteContext {
  containerName: string;
  key: string;
}

/**
 *
 */
export abstract class ObjectStorage {
  /**
   *
   */
  public abstract put(context: PutContext): Promise<PutReturn>;

  /**
   *
   */
  public abstract get(context: GetContext): Promise<GetReturn>;

  /**
   *
   */
  public abstract delete(context: DeleteContext): Promise<void>;

  /**
   *
   */
  protected createKey(): string {
    return new ObjectID().toHexString();
  }
}
