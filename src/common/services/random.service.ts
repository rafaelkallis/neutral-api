import { Injectable } from '@nestjs/common';
import base64url from 'base64url';
import crypto from 'crypto';
import moment from 'moment';

@Injectable()
export class RandomService {
  private static N_SALT_BYTES = 16;

  /**
   * Generates a url-safe, ordered, random string.
   * Similar to MongoDB's ObjectId.
   * 32 timestamp bits.
   * 40 pseudorandom bits.
   * 24 sequence counter bits.
   */
  id(): string {
    const timestampBytes = this.createTimestampBytes(4);
    const randomBytes = this.createRandomBytes(5);
    const counterBytes = this.createCounterBytes(3);
    const idBytes = Buffer.concat(
      [timestampBytes, randomBytes, counterBytes],
      12,
    );
    return base64url.encode(idBytes);
  }

  /**
   * Generates a url-safe, ordered, random string.
   * 48 timestamp bits.
   * 128 pseudorandom bits.
   */
  secureId(): string {
    const timestampBytes = this.createTimestampBytes(6);
    const randomBytes = this.createRandomBytes(16);
    const idBytes = Buffer.concat([timestampBytes, randomBytes], 22);
    return base64url.encode(idBytes);
  }

  /**
   * Generates a 128-bit pseudorandom string.
   * The string is to be used with the mnemonic service.
   */
  mnemonicEntropy(): string {
    return this.createRandomBytes(16).toString('base64');
  }

  /**
   * Generates a pseudorandom string.
   * The length of the salt is specified by the environment
   * variable PBKDF2_N_SALT_BYTES.
   * The salt is to be used with the password service.
   */
  salt(): string {
    return this.createRandomBytes(RandomService.N_SALT_BYTES).toString(
      'base64',
    );
  }

  pin(): string {
    return String(this.createRandomBytes(8).readUInt8(0) % 1000000);
  }

  private createTimestampBytes(bytes: number) {
    const timestampBytes = Buffer.allocUnsafe(bytes);
    const timestamp = moment().unix();
    timestampBytes.writeUIntBE(
      // tslint:disable-next-line:no-bitwise
      timestamp % (1 << (bytes * 8)),
      0,
      bytes,
    );
    return timestampBytes;
  }

  private createRandomBytes(bytes: number) {
    return crypto.randomBytes(bytes);
  }

  private createCounterBytes(bytes: number) {
    const counterBytes = Buffer.allocUnsafe(bytes);
    counterBytes.writeUIntBE(
      // tslint:disable-next-line:no-bitwise
      this.getAndIncrementCounter() % (1 << (bytes * 8)),
      0,
      bytes,
    );
    return counterBytes;
  }

  private getAndIncrementCounter = (() => {
    let counter =
      this.createRandomBytes(32).readUInt32BE(0) % Number.MAX_SAFE_INTEGER;
    return () => {
      if (counter === Number.MAX_SAFE_INTEGER) {
        counter = Number.MIN_SAFE_INTEGER;
      } else {
        counter++;
      }
      return counter;
    };
  })();
}
