import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { InvalidRoleDescriptionException } from 'project/domain/exceptions/InvalidRoleDescriptionException';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class RoleDescription extends StringValueObject {
  protected constructor(value: string) {
    super(value);
    this.assertMaxLength(value, 1024);
  }

  /**
   *
   */
  public static from(value: string): RoleDescription {
    return new RoleDescription(value);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof RoleDescription)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidRoleDescriptionException();
  }
}
