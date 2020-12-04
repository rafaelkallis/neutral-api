import { InternalMilestone } from 'project/domain/milestone/Milestone';
import { MilestoneCancelledEvent } from '../../events/MilestoneCancelledEvent';
import { CancelledMilestoneState } from './CancelledMilestoneState';
import { MilestoneState } from './MilestoneState';

export abstract class CancellableMilestoneState extends MilestoneState {
  public cancel(milestone: InternalMilestone): void {
    milestone.state = CancelledMilestoneState.INSTANCE;
    milestone.project.raise(new MilestoneCancelledEvent(milestone));
  }
}
