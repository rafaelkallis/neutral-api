import { InvalidUserIdException } from 'user/domain/exceptions/InvalidUserIdException';
import { Id } from 'shared/domain/value-objects/Id';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class UserId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static from(id: string): UserId {
    return new UserId(id);
  }

  public static create(): UserId {
    return new UserId(Id.createObjectId());
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof UserId)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidUserIdException();
  }
}
