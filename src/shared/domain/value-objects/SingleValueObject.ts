import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export abstract class SingleValueObject<T> extends ValueObject {
  public readonly value: T;

  protected constructor(value: T) {
    super();
    this.value = value;
  }

  /**
   *
   */
  public equals(other: ValueObject): boolean {
    if (!(other instanceof SingleValueObject)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   *
   */
  public abstract toString(): string;
}
