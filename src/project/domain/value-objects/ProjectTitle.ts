import { InvalidProjectTitleException } from 'project/domain/exceptions/InvalidProjectTitleException';
import { StringValueObject } from 'shared/domain/value-objects/StringValueObject';

/**
 *
 */
export class ProjectTitle extends StringValueObject<ProjectTitle> {
  protected constructor(value: string) {
    super(value);
    this.assertMaxLength(100);
  }

  /**
   *
   */
  public static from(value: string): ProjectTitle {
    return new ProjectTitle(value);
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidProjectTitleException();
  }
}
