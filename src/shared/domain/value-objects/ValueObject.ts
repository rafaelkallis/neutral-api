/**
 *
 */
export abstract class ValueObject {
  /**
   *
   */
  public abstract equals(otherValueObject: ValueObject): boolean;

  /**
   *
   */
  public abstract toString(): string;
}
