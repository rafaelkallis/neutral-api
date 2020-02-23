import { ValueObject } from 'common/domain/value-objects/ValueObject';

/**
 *
 */
export abstract class EnumValueObject<
  V extends string,
  T extends EnumValueObject<V, T>
> extends ValueObject<T> {
  public readonly value: V;

  protected constructor(value: V) {
    super();
    this.value = value;
    this.assertEnum();
  }

  /**
   *
   */
  public equals(other: T): boolean {
    return this.value === other.value;
  }

  /**
   *
   */
  public toString(): string {
    return this.value;
  }

  /**
   *
   */
  protected assertEnum(): void {
    if (!Object.values(this.getEnumType()).includes(this.value)) {
      this.throwInvalidValueObjectException();
    }
  }

  /**
   *
   */
  protected abstract throwInvalidValueObjectException(): never;

  /**
   *
   */
  protected abstract getEnumType(): Record<string, string>;
}
