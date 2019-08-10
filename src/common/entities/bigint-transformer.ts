import { ValueTransformer } from 'typeorm';

export class BigIntTransformer implements ValueTransformer {
  to(data: number | undefined | null): number | null {
    if (typeof data === 'undefined' || data === null) {
      return null;
    }
    return data;
  }

  from(data: string | null): number | null {
    if (typeof data === 'undefined' || data === null) {
      return null;
    }
    const res = parseInt(data, 10);
    return isNaN(res) ? null : res;
  }
}
