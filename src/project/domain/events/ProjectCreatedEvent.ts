import { Project } from 'project/domain/project/Project';
import { ReadonlyUser } from 'user/domain/User';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

@DomainEventKey('project.created')
export class ProjectCreatedEvent extends DomainEvent {
  public readonly project: Project;
  public readonly creator: ReadonlyUser;

  public constructor(project: Project, creator: ReadonlyUser) {
    super();
    this.project = project;
    this.creator = creator;
  }
}
