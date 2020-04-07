import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export abstract class SingleValueObject<
  T,
  TValueObject extends SingleValueObject<T, TValueObject>
> extends ValueObject<TValueObject> {
  public readonly value: T;

  protected constructor(value: T) {
    super();
    this.value = value;
  }

  /**
   *
   */
  public equals(other: TValueObject): boolean {
    return this.value === other.value;
  }

  /**
   *
   */
  public abstract toString(): string;
}
