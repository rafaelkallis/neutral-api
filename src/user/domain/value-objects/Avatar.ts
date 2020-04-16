import { InvalidAvatarException } from 'user/domain/exceptions/InvalidAvatarException';
import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import ObjectID from 'bson-objectid';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class Avatar extends StringValueObject {
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

  public static create(): Avatar {
    return new Avatar(new ObjectID().toHexString());
  }

  public static redacted(): Avatar {
    return new Avatar('[REDACTED]');
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof Avatar)) {
      return false;
    }
    return super.equals(other);
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
