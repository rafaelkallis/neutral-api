import { ProjectState } from 'project/domain/value-objects/states/ProjectState';
import { ProjectFormation } from 'project/domain/value-objects/states/ProjectFormation';
import { ProjectPeerReview } from 'project/domain/value-objects/states/ProjectPeerReview';
import { ProjectManagerReview } from 'project/domain/value-objects/states/ProjectManagerReview';
import { ProjectFinished } from 'project/domain/value-objects/states/ProjectFinished';
import { ProjectArchived } from 'project/domain/value-objects/states/ProjectArchived';
import { ProjectCancelled } from 'project/domain/value-objects/states/ProjectCancelled';
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
  [ProjectStateValue.FORMATION, ProjectFormation.INSTANCE],
  [ProjectStateValue.PEER_REVIEW, ProjectPeerReview.INSTANCE],
  [ProjectStateValue.MANAGER_REVIEW, ProjectManagerReview.INSTANCE],
  [ProjectStateValue.FINISHED, ProjectFinished.INSTANCE],
  [ProjectStateValue.ARCHIVED, ProjectArchived.INSTANCE],
  [ProjectStateValue.CANCELLED, ProjectCancelled.INSTANCE],
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
