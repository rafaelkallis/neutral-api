import { MilestoneState } from 'project/domain/milestone/value-objects/states/MilestoneState';
import { CancellableMilestoneState } from 'project/domain/milestone/value-objects/states/CancellableMilestoneState';
import { InternalMilestone } from 'project/domain/milestone/Milestone';
import { FinishedMilestoneState } from 'project/domain/milestone/value-objects/states/FinishedMilestoneState';
import { ManagerReviewFinishedEvent } from 'project/domain/milestone/events/ManagerReviewFinishedEvent';
import { MilestoneFinishedEvent } from 'project/domain/milestone/events/MilestoneFinishedEvent';

export class ManagerReviewMilestoneState extends CancellableMilestoneState {
  public static readonly INSTANCE: MilestoneState = new ManagerReviewMilestoneState();

  public submitManagerReview(milestone: InternalMilestone): void {
    milestone.state = FinishedMilestoneState.INSTANCE;
    milestone.project.raise(new ManagerReviewFinishedEvent(milestone));
    milestone.project.raise(new MilestoneFinishedEvent(milestone));
  }

  public isTerminal(): boolean {
    return false;
  }

  protected getOrdinal(): number {
    return 1;
  }

  private constructor() {
    super();
  }
}
