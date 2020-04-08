import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { InvalidRoleTitleException } from 'project/domain/exceptions/InvalidRoleTitleException';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class RoleTitle extends StringValueObject {
  private constructor(value: string) {
    super(value);
    this.assertMaxLength(value, 100);
  }

  /**
   *
   */
  public static from(value: string): RoleTitle {
    return new RoleTitle(value);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof RoleTitle)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidRoleTitleException();
  }
}
