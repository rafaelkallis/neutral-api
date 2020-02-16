import { InternalServerErrorException } from '@nestjs/common';
import { Validator } from 'class-validator';
import { InvalidProjectStateException } from 'project/domain/exceptions/InvalidProjectStateException';
import { EnumValueObject } from 'common/domain/value-objects/EnumValueObject';

export enum ProjectStateValue {
  FORMATION = 'formation',
  PEER_REVIEW = 'peer-review',
  MANAGER_REVIEW = 'manager-review',
  FINISHED = 'finished',
}

/**
 *
 */
export abstract class ProjectState extends EnumValueObject<
  ProjectStateValue,
  ProjectState
> {
  public static FORMATION = ProjectState.from(ProjectStateValue.FORMATION);
  public static PEER_REVIEW = ProjectState.from(ProjectStateValue.PEER_REVIEW);
  public static MANAGER_REVIEW = ProjectState.from(
    ProjectStateValue.MANAGER_REVIEW,
  );
  public static FINISHED = ProjectState.from(ProjectStateValue.FINISHED);

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
        return FormationProjectState.INSTANCE;
      }
      case ProjectStateValue.PEER_REVIEW: {
        return PeerReviewProjectState.INSTANCE;
      }
      case ProjectStateValue.MANAGER_REVIEW: {
        return ManagerReviewProjectState.INSTANCE;
      }
      case ProjectStateValue.FINISHED: {
        return FinishedProjectState.INSTANCE;
      }
      default: {
        throw new InternalServerErrorException();
      }
    }
  }

  public isFormation(): boolean {
    return this.equals(ProjectState.FORMATION);
  }

  public isPeerReview(): boolean {
    return this.equals(ProjectState.PEER_REVIEW);
  }

  public isManagerReview(): boolean {
    return this.equals(ProjectState.MANAGER_REVIEW);
  }

  public isFinished(): boolean {
    return this.equals(ProjectState.FINISHED);
  }
}

/**
 *
 */
class FormationProjectState extends ProjectState {
  public static readonly INSTANCE = new FormationProjectState();

  private constructor() {
    super();
  }

  /**
   *
   */
  public toValue(): ProjectStateValue {
    return ProjectStateValue.FORMATION;
  }
}

/**
 *
 */
class PeerReviewProjectState extends ProjectState {
  public static readonly INSTANCE = new PeerReviewProjectState();

  private constructor() {
    super();
  }

  /**
   *
   */
  public toValue(): ProjectStateValue {
    return ProjectStateValue.PEER_REVIEW;
  }
}

/**
 *
 */
class ManagerReviewProjectState extends ProjectState {
  public static readonly INSTANCE = new ManagerReviewProjectState();

  private constructor() {
    super();
  }

  /**
   *
   */
  public toValue(): ProjectStateValue {
    return ProjectStateValue.MANAGER_REVIEW;
  }
}

/**
 *
 */
class FinishedProjectState extends ProjectState {
  public static readonly INSTANCE = new FinishedProjectState();

  private constructor() {
    super();
  }

  /**
   *
   */
  public toValue(): ProjectStateValue {
    return ProjectStateValue.FINISHED;
  }
}
