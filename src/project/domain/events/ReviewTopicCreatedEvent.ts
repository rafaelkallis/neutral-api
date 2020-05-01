import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';

@DomainEventKey('project.review_topic_created')
export class ReviewTopicCreatedEvent extends DomainEvent {
  public readonly projectId: ProjectId;
  public readonly reviewTopicId: ReviewTopicId;

  public constructor(projecId: ProjectId, reviewTopicId: ReviewTopicId) {
    super();
    this.projectId = projecId;
    this.reviewTopicId = reviewTopicId;
  }
}
