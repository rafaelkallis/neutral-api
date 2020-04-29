import { Id } from 'shared/domain/value-objects/Id';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { InvalidProjectIdException } from 'project/domain/exceptions/InvalidProjectIdException';

/**
 *
 */
export class ProjectId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static from(id: string): ProjectId {
    return new ProjectId(id);
  }

  public static create(): ProjectId {
    return new ProjectId(Id.createObjectId());
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof ProjectId)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidProjectIdException();
  }
}
