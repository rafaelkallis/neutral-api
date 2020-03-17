import { Validator } from 'class-validator';
import { InvalidEmailException } from 'user/domain/exceptions/InvalidEmailException';
import { StringValueObject } from 'common/domain/value-objects/StringValueObject';

/**
 *
 */
export class Email extends StringValueObject<Email> {
  private constructor(value: string) {
    super(value);
    this.assertEmail(value);
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

  private assertEmail(value: string): void {
    if (value === '[REDACTED]') {
      return;
    }
    const validator = new Validator();
    if (!validator.isEmail(value) || !validator.maxLength(value, 100)) {
      throw new InvalidEmailException();
    }
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidEmailException();
  }
}
