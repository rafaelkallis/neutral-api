import { ProjectState } from 'project/domain/project/value-objects/states/ProjectState';
import { FormationProjectState } from 'project/domain/project/value-objects/states/FormationProjectState';
import { ArchivedProjectState } from 'project/domain/project/value-objects/states/ArchivedProjectState';
import { CancelledProjectState } from 'project/domain/project/value-objects/states/CancelledProjectState';
import { InvalidProjectStateException } from 'project/domain/exceptions/InvalidProjectStateException';
import { ActiveProjectState } from 'project/domain/project/value-objects/states/ActiveProjectState';

export enum ProjectStateValue {
  CANCELLED = 'cancelled',
  FORMATION = 'formation',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

// TODO need a better solution than this

const associations: [ProjectStateValue, ProjectState][] = [
  [ProjectStateValue.CANCELLED, CancelledProjectState.INSTANCE],
  [ProjectStateValue.FORMATION, FormationProjectState.INSTANCE],
  [ProjectStateValue.ACTIVE, ActiveProjectState.INSTANCE],
  [ProjectStateValue.ARCHIVED, ArchivedProjectState.INSTANCE],
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
