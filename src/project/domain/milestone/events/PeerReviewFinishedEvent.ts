import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ReadonlyMilestone } from 'project/domain/milestone/Milestone';

@DomainEventKey('project.peer_review_finished')
export class PeerReviewFinishedEvent extends DomainEvent {
  public readonly milestone: ReadonlyMilestone;

  constructor(milestone: ReadonlyMilestone) {
    super();
    this.milestone = milestone;
  }
}
