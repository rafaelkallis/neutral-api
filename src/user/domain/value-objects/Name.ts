import { ValueObject } from 'common/domain/value-objects/ValueObject';
import { InvalidNameException } from 'user/domain/exceptions/InvalidNameException';

/**
 *
 */
export class Name extends ValueObject<Name> {
  public readonly first: string;
  public readonly last: string;

  private constructor(first: string, last: string) {
    super();
    this.first = first;
    this.last = last;
    this.assertFirst(first);
    this.assertLast(last);
  }

  /**
   *
   */
  public static from(first: string, last: string): Name {
    return new Name(first, last);
  }

  public static redacted(): Name {
    return new Name('[REDACTED]', '[REDACTED]');
  }

  /**
   *
   */
  public equals(otherName: Name): boolean {
    return this.first === otherName.first && this.last === otherName.last;
  }

  /**
   *
   */
  public toString(): string {
    return `${this.first} ${this.last}`;
  }

  private assertFirst(value: string): void {
    if (typeof value !== 'string' || value.length > 100) {
      throw new InvalidNameException();
    }
  }

  private assertLast(value: string): void {
    if (typeof value !== 'string' || value.length > 100) {
      throw new InvalidNameException();
    }
  }
}
