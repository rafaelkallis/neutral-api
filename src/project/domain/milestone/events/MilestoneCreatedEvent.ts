import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ReadonlyMilestone } from 'project/domain/milestone/Milestone';

@DomainEventKey('project.milestone_created')
export class MilestoneCreatedEvent extends DomainEvent {
  public readonly milestone: ReadonlyMilestone;

  public constructor(milestone: ReadonlyMilestone) {
    super();
    this.milestone = milestone;
  }
}
