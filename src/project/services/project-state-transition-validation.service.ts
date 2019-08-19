import { Injectable } from '@nestjs/common';
import { ProjectState } from '../../common';
import { ForbiddenProjectStateChangeException } from '../exceptions/forbidden-project-state-change.exception';

/**
 * Project State Transition Validation Service
 */
@Injectable()
export class ProjectStateTransitionValidationService {
  public constructor() {
    this.validTransitions = {};
    const { FORMATION, PEER_REVIEW, FINISHED } = ProjectState;

    /* self loops */
    this.addTransition(FORMATION, FORMATION);
    this.addTransition(PEER_REVIEW, PEER_REVIEW);
    this.addTransition(FINISHED, FINISHED);

    /* other transitions */
    this.addTransition(FORMATION, PEER_REVIEW);
    this.addTransition(PEER_REVIEW, FINISHED);
  }

  public validateTransition(
    curState: ProjectState,
    nextState: ProjectState,
  ): void {
    if (!this.hasTransition(curState, nextState)) {
      throw new ForbiddenProjectStateChangeException();
    }
  }

  private readonly validTransitions: {
    [from: string]: {
      [to: string]: true;
    };
  };

  private addTransition(from: ProjectState, to: ProjectState): void {
    if (!this.validTransitions[from]) {
      this.validTransitions[from] = {};
    }
    this.validTransitions[from][to] = true;
  }

  private hasTransition(from: string, to: string): boolean {
    if (!this.validTransitions[from]) {
      return false;
    }
    return Boolean(this.validTransitions[from][to]);
  }
}
