import { Project } from 'project/domain/project/Project';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

@DomainEventKey('project.peer_review_started')
export class ProjectPeerReviewStartedEvent extends DomainEvent {
  public readonly project: Project;

  constructor(project: Project) {
    super();
    this.project = project;
  }
}
