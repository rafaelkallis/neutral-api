import { BiMap, ReadonlyBiMap } from 'shared/domain/BiMap';
import { Type, Abstract } from '@nestjs/common';

export class StaticBiMap<T, U>
  implements ReadonlyBiMap<Abstract<T> | Type<T>, Abstract<U> | Type<U>> {
  private readonly biMap: BiMap<Abstract<T> | Type<T>, Abstract<U> | Type<U>>;
  public constructor() {
    this.biMap = BiMap.empty();
  }

  public d(tType: Abstract<T> | Type<T>): ClassDecorator {
    return (uType: Abstract<U> | Type<U>): void => {
      this.biMap.put(tType, uType);
    };
  }

  public get(tType: Abstract<T> | Type<T>): Abstract<U> | Type<U> | null {
    return this.biMap.get(tType);
  }

  public inverse(): ReadonlyBiMap<
    Abstract<U> | Type<U>,
    Abstract<T> | Type<T>
  > {
    return this.biMap.inverse();
  }
}
