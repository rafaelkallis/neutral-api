import { InvalidAvatarException } from 'user/domain/exceptions/InvalidAvatarException';
import { Validator } from 'class-validator';
import { StringValueObject } from 'common/domain/value-objects/StringValueObject';

/**
 *
 */
export class Avatar extends StringValueObject<Avatar> {
  private constructor(url: string) {
    Avatar.assertUrl(url);
    super(url);
  }

  /**
   *
   */
  public static from(url: string): Avatar {
    return new Avatar(url);
  }

  private static assertUrl(value: string): void {
    const validator = new Validator();
    if (!validator.isURL(value)) {
      throw new InvalidAvatarException();
    }
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidAvatarException();
  }
}
