import { AtomicValueObject } from 'shared/domain/value-objects/AtomicValueObject';
import { InvalidStringException } from '../exceptions/InvalidStringException';
import { ValueObject } from './ValueObject';

/**
 *
 */
export abstract class StringValueObject extends AtomicValueObject<string> {
  protected constructor(value: string) {
    super(value);
    this.assertString(value);
  }

  /**
   *
   */
  public toString(): string {
    return this.value;
  }

  public equals(other: ValueObject): boolean {
    return other instanceof StringValueObject && super.equals(other);
  }

  private assertString(value: string): void {
    if (typeof value !== 'string') {
      this.throwInvalidValueObjectException();
    }
  }

  protected assertMaxLength(value: string, maxLength: number): void {
    if (value.length > maxLength) {
      this.throwInvalidValueObjectException();
    }
  }

  protected assertMinLength(value: string, minLength: number): void {
    if (value.length < minLength) {
      this.throwInvalidValueObjectException();
    }
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidStringException();
  }
}
