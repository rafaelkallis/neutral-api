import { CacheKeyComputer } from 'shared/cache/application/CacheKeyComputer';
import crypto from 'crypto';

export class Sha1CacheKeyComputer extends CacheKeyComputer {
  public computeKey(keyArgs: string[]): string {
    const hash = crypto.createHash('sha1');
    for (const keyArg of keyArgs) {
      hash.update(keyArg);
    }
    return hash.digest().toString('utf8');
  }
}
