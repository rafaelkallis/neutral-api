import { MilestoneState } from './MilestoneState';
import { CancelledMilestoneState } from './CancelledMilestoneState';
import { FinishedMilestoneState } from './FinishedMilestoneState';
import { ManagerReviewMilestoneState } from './ManagerReviewMilestoneState';
import { PeerReviewMilestoneState } from './PeerReviewMilestoneState';

export enum MilestoneStateValue {
  PEER_REVIEW = 'peer-review',
  MANAGER_REVIEW = 'manager-review',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

// TODO need a better solution than this

const associations: [MilestoneStateValue, MilestoneState][] = [
  [MilestoneStateValue.PEER_REVIEW, PeerReviewMilestoneState.INSTANCE],
  [MilestoneStateValue.MANAGER_REVIEW, ManagerReviewMilestoneState.INSTANCE],
  [MilestoneStateValue.FINISHED, FinishedMilestoneState.INSTANCE],
  [MilestoneStateValue.CANCELLED, CancelledMilestoneState.INSTANCE],
];

export function getMilestoneState(
  targetValue: MilestoneStateValue,
): MilestoneState {
  for (const [value, state] of associations) {
    if (value === targetValue) {
      return state;
    }
  }
  throw new Error('invalid milestone state');
}

export function getMilestoneStateValue(
  targetState: MilestoneState,
): MilestoneStateValue {
  for (const [value, state] of associations) {
    if (state.equals(targetState)) {
      return value;
    }
  }
  throw new Error('invalid milestone state');
}
