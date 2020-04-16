import { Validator } from 'class-validator';
import { InvalidProjectStateException } from 'project/domain/exceptions/InvalidProjectStateException';
import { EnumValueObject } from 'shared/domain/value-objects/EnumValueObject';
import { ProjectStateAssertionFailureException } from 'project/domain/exceptions/ProjectStateViolationException';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';

export enum ProjectStateValue {
  FORMATION = 'formation',
  PEER_REVIEW = 'peer-review',
  MANAGER_REVIEW = 'manager-review',
  FINISHED = 'finished',
  ARCHIVED = 'archived',
}

/**
 *
 */
export class ProjectState extends EnumValueObject<ProjectStateValue> {
  public static readonly FORMATION = new ProjectState(
    ProjectStateValue.FORMATION,
  );
  public static readonly PEER_REVIEW = new ProjectState(
    ProjectStateValue.PEER_REVIEW,
  );
  public static readonly MANAGER_REVIEW = new ProjectState(
    ProjectStateValue.MANAGER_REVIEW,
  );
  public static readonly FINISHED = new ProjectState(
    ProjectStateValue.FINISHED,
  );
  public static readonly ARCHIVED = new ProjectState(
    ProjectStateValue.ARCHIVED,
  );

  /**
   *
   */
  public static from(value: ProjectStateValue): ProjectState {
    const validator = new Validator();
    if (!validator.isEnum(value, ProjectStateValue)) {
      throw new InvalidProjectStateException();
    }
    switch (value) {
      case ProjectStateValue.FORMATION: {
        return ProjectState.FORMATION;
      }
      case ProjectStateValue.PEER_REVIEW: {
        return ProjectState.PEER_REVIEW;
      }
      case ProjectStateValue.MANAGER_REVIEW: {
        return ProjectState.MANAGER_REVIEW;
      }
      case ProjectStateValue.FINISHED: {
        return ProjectState.FINISHED;
      }
      case ProjectStateValue.ARCHIVED: {
        return ProjectState.ARCHIVED;
      }
      default: {
        throw new InvalidProjectStateException();
      }
    }
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof ProjectState)) {
      return false;
    }
    return super.equals(other);
  }

  public assertEquals(expectedState: ProjectState): void {
    if (!this.equals(expectedState)) {
      throw ProjectStateAssertionFailureException.from(this, expectedState);
    }
  }

  protected getEnumType(): Record<string, string> {
    return ProjectStateValue;
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidProjectStateException();
  }
}
