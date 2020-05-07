import { ProjectState } from 'project/domain/project/value-objects/states/ProjectState';
import { FormationProjectState } from 'project/domain/project/value-objects/states/FormationProjectState';
import { ProjectPeerReview } from 'project/domain/project/value-objects/states/ProjectPeerReview';
import { ManagerReviewProjectState } from 'project/domain/project/value-objects/states/ManagerReviewProjectState';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import { ArchivedProjectState } from 'project/domain/project/value-objects/states/ArchivedProjectState';
import { CancelledProjectState } from 'project/domain/project/value-objects/states/CancelledProjectState';
import { InvalidProjectStateException } from 'project/domain/exceptions/InvalidProjectStateException';

export enum ProjectStateValue {
  FORMATION = 'formation',
  PEER_REVIEW = 'peer-review',
  MANAGER_REVIEW = 'manager-review',
  FINISHED = 'finished',
  ARCHIVED = 'archived',
  CANCELLED = 'cancelled',
}

// TODO need a better solution than this

const associations: [ProjectStateValue, ProjectState][] = [
  [ProjectStateValue.FORMATION, FormationProjectState.INSTANCE],
  [ProjectStateValue.PEER_REVIEW, ProjectPeerReview.INSTANCE],
  [ProjectStateValue.MANAGER_REVIEW, ManagerReviewProjectState.INSTANCE],
  [ProjectStateValue.FINISHED, FinishedProjectState.INSTANCE],
  [ProjectStateValue.ARCHIVED, ArchivedProjectState.INSTANCE],
  [ProjectStateValue.CANCELLED, CancelledProjectState.INSTANCE],
];

export function getProjectState(targetValue: ProjectStateValue): ProjectState {
  for (const [value, state] of associations) {
    if (value === targetValue) {
      return state;
    }
  }
  throw new InvalidProjectStateException();
}

export function getProjectStateValue(
  targetState: ProjectState,
): ProjectStateValue {
  for (const [value, state] of associations) {
    if (state.equals(targetState)) {
      return value;
    }
  }
  throw new InvalidProjectStateException();
}
