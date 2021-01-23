import { InvalidRoleIdException } from 'project/domain/exceptions/InvalidRoleIdException';
import { Id } from 'shared/domain/value-objects/Id';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class RoleId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static from(id: string): RoleId {
    return new RoleId(id);
  }

  public static create(): RoleId {
    return new RoleId(Id.createInner());
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof RoleId)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidRoleIdException();
  }
}
