import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { InvalidProjectDescriptionException } from 'project/domain/exceptions/InvalidProjectDescriptionException';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

/**
 *
 */
export class ProjectDescription extends StringValueObject {
  private constructor(value: string) {
    super(value);
    this.assertMaxLength(value, 1024);
  }

  /**
   *
   */
  public static from(value: string): ProjectDescription {
    return new ProjectDescription(value);
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof ProjectDescription)) {
      return false;
    }
    return super.equals(other);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidProjectDescriptionException();
  }
}
