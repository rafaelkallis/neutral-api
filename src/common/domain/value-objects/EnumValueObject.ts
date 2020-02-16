import { ValueObject } from 'common/domain/ValueObject';

/**
 *
 */
export abstract class EnumValueObject<
  E extends {},
  T extends EnumValueObject<E, T>
> extends ValueObject<T> {
  /**
   *
   */
  public abstract toValue(): E;

  /**
   *
   */
  public equals(other: T): boolean {
    return this.toValue() === other.toValue();
  }

  /**
   *
   */
  public toString(): string {
    return this.toValue().toString();
  }
}
