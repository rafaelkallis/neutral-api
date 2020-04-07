import { InvalidAvatarException } from 'user/domain/exceptions/InvalidAvatarException';
import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import ObjectID from 'bson-objectid';

/**
 *
 */
export class Avatar extends StringValueObject<Avatar> {
  private constructor(key: string) {
    super(key);
    this.assertKey(key);
  }

  /**
   *
   */
  public static from(key: string): Avatar {
    return new Avatar(key);
  }

  public static redacted(): Avatar {
    return new Avatar('[REDACTED]');
  }

  private assertKey(value: string): void {
    if (value === '[REDACTED]') {
      return;
    }
    if (!ObjectID.isValid(value)) {
      this.throwInvalidValueObjectException();
    }
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidAvatarException();
  }
}
