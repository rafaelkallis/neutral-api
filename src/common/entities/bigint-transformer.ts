import { ValueTransformer } from 'typeorm';

/**
 * Value transformer for bigint.
 */
export class BigIntTransformer implements ValueTransformer {
  /**
   * To
   */
  public to(data: number | undefined | null): number | null {
    if (typeof data === 'undefined' || data === null) {
      return null;
    }
    return data;
  }

  /**
   * From
   */
  public from(data: string | null): number | null {
    if (typeof data === 'undefined' || data === null) {
      return null;
    }
    const res = parseInt(data, 10);
    return isNaN(res) ? null : res;
  }
}
