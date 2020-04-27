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
}
