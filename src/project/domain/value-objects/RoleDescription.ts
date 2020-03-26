import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { InvalidRoleDescriptionException } from 'project/domain/exceptions/InvalidRoleDescriptionException';

/**
 *
 */
export class RoleDescription extends StringValueObject<RoleDescription> {
  protected constructor(value: string) {
    super(value);
    this.assertMaxLength(1024);
  }

  /**
   *
   */
  public static from(value: string): RoleDescription {
    return new RoleDescription(value);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidRoleDescriptionException();
  }
}
