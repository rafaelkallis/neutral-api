import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';
import { InvalidProjectDescriptionException } from 'project/domain/exceptions/InvalidProjectDescriptionException';

/**
 *
 */
export class ProjectDescription extends StringValueObject<ProjectDescription> {
  private constructor(value: string) {
    super(value);
    this.assertMaxLength(1024);
  }

  /**
   *
   */
  public static from(value: string): ProjectDescription {
    return new ProjectDescription(value);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidProjectDescriptionException();
  }
}
