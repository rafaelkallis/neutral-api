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

  public abstract isValid(): boolean;
}
