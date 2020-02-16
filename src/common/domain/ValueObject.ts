/**
 *
 */
export abstract class ValueObject<T extends ValueObject<T>> {
  /**
   *
   */
  public abstract equals(otherValueObject: ValueObject<T>): boolean;

  /**
   *
   */
  public abstract toString(): string;
}
