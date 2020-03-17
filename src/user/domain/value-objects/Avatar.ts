import { InvalidAvatarException } from 'user/domain/exceptions/InvalidAvatarException';
import { StringValueObject } from 'common/domain/value-objects/StringValueObject';
import ObjectID from 'bson-objectid';

/**
 *
 */
export class Avatar extends StringValueObject<Avatar> {
  private constructor(key: string) {
    super(key);
    Avatar.assertKey(key);
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

  private static assertKey(value: string): void {
    if (value === '[REDACTED]') {
      return;
    }
    if (!ObjectID.isValid(value)) {
      throw new InvalidAvatarException();
    }
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidAvatarException();
  }
}
