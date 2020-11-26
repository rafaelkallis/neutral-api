import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ReadonlyMilestone } from '../milestone/Milestone';

@DomainEventKey('project.milestone_cancelled')
export class MilestoneCancelledEvent extends DomainEvent {
  public readonly milestone: ReadonlyMilestone;

  public constructor(milestone: ReadonlyMilestone) {
    super();
    this.milestone = milestone;
  }
}
