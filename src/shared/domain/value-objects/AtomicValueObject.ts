import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export abstract class AtomicValueObject<T> extends ValueObject {
  public readonly value: T;

  protected constructor(value: T) {
    super();
    this.value = value;
  }

  public equals(other: ValueObject): boolean {
    return other instanceof AtomicValueObject && this.value === other.value;
  }
}
