import { BiMap, ReadonlyBiMap } from 'shared/domain/BiMap';
import { Type, Abstract } from '@nestjs/common';

export class StaticTypeMap<T, U>
  implements ReadonlyBiMap<Abstract<T> | Type<T>, Abstract<U> | Type<U>> {
  private readonly map: BiMap<Abstract<T> | Type<T>, Abstract<U> | Type<U>>;
  public constructor() {
    this.map = new BiMap();
  }

  public d(tType: Abstract<T> | Type<T>): ClassDecorator {
    return (uType: Abstract<U> | Type<U>): void => {
      this.map.put(tType, uType);
    };
  }

  public get(tType: Abstract<T> | Type<T>): Abstract<U> | Type<U> | null {
    return this.map.get(tType);
  }

  public getReverse(
    uType: Abstract<U> | Type<U>,
  ): Abstract<T> | Type<T> | null {
    return this.map.getReverse(uType);
  }
}
