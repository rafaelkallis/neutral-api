import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { InvalidRoleTitleException } from 'project/domain/exceptions/InvalidRoleTitleException';

/**
 *
 */
export class RoleTitle extends StringValueObject<RoleTitle> {
  protected constructor(value: string) {
    super(value);
    this.assertMaxLength(value, 100);
  }

  /**
   *
   */
  public static from(value: string): RoleTitle {
    return new RoleTitle(value);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidRoleTitleException();
  }
}
