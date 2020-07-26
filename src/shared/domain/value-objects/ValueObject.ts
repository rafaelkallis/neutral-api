/**
 *
 */
export abstract class ValueObject {
  /**
   *
   */
  public equals(other: ValueObject): boolean {
    return this === other;
  }

  public equalsAny(others: Iterable<ValueObject>): boolean {
    return Array.from(others).some((other) => this.equals(other));
  }
}
