import { Abstract, Type } from '@nestjs/common';

export type Class<T> = Abstract<T> | Type<T>;

export class ClassHierarchyIterable {
  public static *of(clazz: Function): Iterable<Function> {
    // eslint-disable-next-line no-prototype-builtins
    while (!clazz.isPrototypeOf(Function)) {
      yield clazz;
      clazz = Object.getPrototypeOf(clazz);
    }
  }
}
