import { ValueObject } from 'common/domain/ValueObject';
import { Validator } from 'class-validator';
import { InvalidProjectDescriptionException } from 'project/domain/exceptions/InvalidProjectDescriptionException';

/**
 *
 */
export class ProjectDescription extends ValueObject<ProjectDescription> {
  public readonly value: string;

  private constructor(value: string) {
    super();
    const validator = new Validator();
    if (!validator.isString(value) || !validator.maxLength(value, 1024)) {
      throw new InvalidProjectDescriptionException();
    }
    this.value = value;
  }

  /**
   *
   */
  public static from(value: string): ProjectDescription {
    return new ProjectDescription(value);
  }

  /**
   *
   */
  public equals(other: ProjectDescription): boolean {
    return this.value === other.value;
  }

  /**
   *
   */
  public toString(): string {
    return this.value;
  }
}
