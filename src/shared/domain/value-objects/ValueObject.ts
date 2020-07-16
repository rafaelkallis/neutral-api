/**
 *
 */
export abstract class ValueObject {
  /**
   *
   */
  public equals(otherValueObject: ValueObject): boolean {
    return this === otherValueObject;
  }

  public equalsAny(others: Iterable<ValueObject>): boolean {
    return Array.from(others).some((other) => this.equals(other));
  }
}
