import { isEmail } from 'class-validator';
import { InvalidEmailException } from 'user/domain/exceptions/InvalidEmailException';
import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class Email extends StringValueObject {
  private constructor(value: string) {
    super(value);
    this.assertEmail(value);
    this.assertMaxLength(value, 100);
  }

  /**
   *
   */
  public static from(email: string): Email {
    return new Email(email);
  }

  /**
   *
   */
  public static redacted(): Email {
    return new Email('[REDACTED]');
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof Email)) {
      return false;
    }
    return super.equals(other);
  }

  private assertEmail(value: string): void {
    if (value !== '[REDACTED]' && !isEmail(value)) {
      this.throwInvalidValueObjectException();
    }
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidEmailException();
  }
}
