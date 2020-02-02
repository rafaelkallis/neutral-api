import ObjectID from 'bson-objectid';

/**
 *
 */
export abstract class ModelFactoryService {
  /**
   *
   */
  protected createId(): string {
    return new ObjectID().toHexString();
  }
}
