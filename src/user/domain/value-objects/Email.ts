import { ValueObject } from 'common/domain/ValueObject';
import { Validator } from 'class-validator';
import { InvalidEmailException } from 'user/domain/exceptions/InvalidEmailException';

/**
 *
 */
export class Email extends ValueObject<Email> {
  public readonly value: string;

  private constructor(value: string) {
    super();
    this.value = value;
  }

  /**
   *
   */
  public static from(email: string): Email {
    const validator = new Validator();
    if (
      typeof email !== 'string' ||
      !validator.isEmail(email) ||
      !validator.maxLength(email, 100)
    ) {
      throw new InvalidEmailException();
    }
    return new Email(email);
  }

  /**
   *
   */
  public equals(otherEmail: Email): boolean {
    return this.value === otherEmail.value;
  }

  /**
   *
   */
  public toString(): string {
    return this.value;
  }
}
