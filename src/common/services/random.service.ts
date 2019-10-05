import { Injectable } from '@nestjs/common';
import ObjectId from 'bson-objectid';

/**
 * Random Service
 */
@Injectable()
export class RandomService {
  /**
   * Generates a url-safe, ordered, random string.
   * Id generation scheme based on MongoDB's ObjectId.
   */
  public id(): string {
    return new ObjectId().toHexString();
  }
}
