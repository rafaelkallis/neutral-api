import { Validator } from 'class-validator';
import { InvalidProjectStateException } from 'project/domain/exceptions/InvalidProjectStateException';
import { EnumValueObject } from 'shared/domain/value-objects/EnumValueObject';
import { ProjectStateAssertionFailureException } from '../exceptions/ProjectStateViolationException';

export enum ProjectStateValue {
  FORMATION = 'formation',
  PEER_REVIEW = 'peer-review',
  MANAGER_REVIEW = 'manager-review',
  FINISHED = 'finished',
}

/**
 *
 */
export class ProjectState extends EnumValueObject<
  ProjectStateValue,
  ProjectState
> {
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
      default: {
        throw new InvalidProjectStateException();
      }
    }
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
