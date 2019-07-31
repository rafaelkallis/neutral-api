import { Injectable } from '@nestjs/common';
import { pbkdf2 } from 'crypto';
import { RandomService } from '../random/random.service';
import { IncorrectPasswordException } from './incorrect-password.exception';

@Injectable()
export class PasswordService {
  private static N_ITERATIONS = 500000;
  private static N_KEY_BYTES = 64;
  private static DIGEST = 'sha512';

  constructor(private randomService: RandomService) {}

  /**
   * Produces a cryptographic hash for the given password plaintext and salt.
   */
  async hash(plaintext: string): Promise<string> {
    const salt = this.randomService.salt();
    return this.internalHash(
      plaintext,
      salt,
      PasswordService.N_ITERATIONS,
      PasswordService.N_KEY_BYTES,
      PasswordService.DIGEST,
    );
  }

  /**
   * Compares the given password paintext and salt against the cryptographic hash.
   */
  async verify(plaintext: string, hash: string): Promise<boolean> {
    const [salt, iterations, keylen, digest, derivedKey] = hash.split('$');
    return (
      derivedKey ===
      (await this.internalHash(
        plaintext,
        salt,
        parseInt(iterations, 10),
        parseInt(keylen, 10),
        digest,
      ))
    );
  }

  async verifyOrFail(plaintext: string, hash: string): Promise<void> {
    if (!(await this.verify(plaintext, hash))) {
      throw new IncorrectPasswordException();
    }
  }

  private async internalHash(
    plaintext: string,
    salt: string,
    iterations: number,
    keylen: number,
    digest: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      pbkdf2(plaintext, salt, iterations, keylen, digest, (err, derivedKey) => {
        if (err) {
          reject(err);
        }
        resolve(
          [salt, iterations, keylen, digest, derivedKey.toString('hex')].join(
            '$',
          ),
        );
      });
    });
  }
}
