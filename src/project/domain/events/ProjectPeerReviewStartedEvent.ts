import { ReadonlyProject } from 'project/domain/project/Project';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ReadonlyUserCollection } from 'user/domain/UserCollection';

@DomainEventKey('project.peer_review_started')
export class ProjectPeerReviewStartedEvent extends DomainEvent {
  public readonly project: ReadonlyProject;
  public readonly assignees: ReadonlyUserCollection;

  constructor(project: ReadonlyProject, assignees: ReadonlyUserCollection) {
    super();
    this.project = project;
    this.assignees = assignees;
  }
}
