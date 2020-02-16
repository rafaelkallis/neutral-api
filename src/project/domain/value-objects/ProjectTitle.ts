import { ValueObject } from 'common/domain/ValueObject';
import { Validator } from 'class-validator';
import { InvalidProjectTitleException } from 'project/domain/exceptions/InvalidProjectTitleException';

/**
 *
 */
export class ProjectTitle extends ValueObject<ProjectTitle> {
  public readonly value: string;

  private constructor(value: string) {
    super();
    const validator = new Validator();
    if (!validator.isString(value) || !validator.maxLength(value, 100)) {
      throw new InvalidProjectTitleException();
    }
    this.value = value;
  }

  /**
   *
   */
  public static from(value: string): ProjectTitle {
    return new ProjectTitle(value);
  }

  /**
   *
   */
  public equals(other: ProjectTitle): boolean {
    return this.value === other.value;
  }

  /**
   *
   */
  public toString(): string {
    return this.value;
  }
}
