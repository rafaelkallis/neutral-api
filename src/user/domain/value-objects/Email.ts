import { isEmail } from 'class-validator';
import { InvalidEmailException } from 'user/domain/exceptions/InvalidEmailException';
import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class Email extends StringValueObject {
  protected constructor(value: string) {
    super(value);
    this.assertEmail(value);
    this.assertMaxLength(value, 100);
  }

  /**
   *
   */
  public static of(email: string): Email {
    return new Email(email);
  }

  /**
   *
   */
  public static get REDACTED(): Email {
    return RedactedEmail.INSTANCE;
  }

  public isPresent(): boolean {
    return true;
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

export class RedactedEmail extends Email {
  public static INSTANCE = new RedactedEmail();
  protected constructor() {
    super('[REDACTED]');
  }
  public isPresent(): boolean {
    return false;
  }
}
