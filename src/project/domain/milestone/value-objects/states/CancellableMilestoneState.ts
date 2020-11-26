import { MilestoneStateDecorator } from 'project/domain/milestone/value-objects/states/MilestoneStateDecorator';
import { MilestoneCancelledEvent } from 'project/domain/events/MilestoneCancelledEvent';
import { InternalMilestone } from 'project/domain/milestone/Milestone';
import { CancelledMilestoneState } from './CancelledMilestoneState';
import { MilestoneState } from './MilestoneState';

export abstract class CancellableMilestoneState extends MilestoneState {
  public cancel(milestone: InternalMilestone): void {
    milestone.state = CancelledMilestoneState.INSTANCE;
    milestone.project.raise(new MilestoneCancelledEvent(milestone));
  }
}
