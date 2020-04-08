import { InvalidProjectTitleException } from 'project/domain/exceptions/InvalidProjectTitleException';
import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class ProjectTitle extends StringValueObject {
  protected constructor(value: string) {
    super(value);
    this.assertMaxLength(value, 100);
  }

  /**
   *
   */
  public static from(value: string): ProjectTitle {
    return new ProjectTitle(value);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof ProjectTitle)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidProjectTitleException();
  }
}
