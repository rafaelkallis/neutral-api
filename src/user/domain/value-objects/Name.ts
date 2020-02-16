import { ValueObject } from 'common/domain/ValueObject';
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
  }

  /**
   *
   */
  public static from(first: string, last: string): Name {
    if (typeof first !== 'string' || first.length > 100) {
      throw new InvalidNameException();
    }
    if (typeof last !== 'string' || last.length > 100) {
      throw new InvalidNameException();
    }
    return new Name(first, last);
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
}
