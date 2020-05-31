import { Map, ReadonlyMap } from 'shared/domain/Map';
import { Type, Abstract } from '@nestjs/common';

export class StaticMap<U, V>
  implements ReadonlyMap<Abstract<U> | Type<U>, Abstract<V> | Type<V>> {
  private readonly map: Map<Abstract<U> | Type<U>, Abstract<V> | Type<V>>;
  public constructor() {
    this.map = Map.empty();
  }

  public d(vType: Abstract<V> | Type<V>): ClassDecorator {
    return (uType: Abstract<U> | Type<U>): void => {
      this.map.put(uType, vType);
    };
  }

  public get(uType: Abstract<U> | Type<U>): Abstract<V> | Type<V> | null {
    return this.map.get(uType);
  }

  public inverse(): ReadonlyMap<
    Abstract<V> | Type<V>,
    (Abstract<U> | Type<U>)[]
  > {
    return this.map.inverse();
  }
}
