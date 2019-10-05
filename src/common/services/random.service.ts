import { Injectable } from '@nestjs/common';
import base64url from 'base64url';
import crypto from 'crypto';
import ObjectId from 'bson-objectid';

/**
 * Random Service
 */
@Injectable()
export class RandomService {
  private static readonly N_SALT_BYTES = 16;

  /**
   * Generates a url-safe, ordered, random string.
   * Id generation scheme based on MongoDB's ObjectId.
   */
  public id(): string {
    return new ObjectId().toHexString();
  }
}
