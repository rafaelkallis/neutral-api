import { Project } from 'project/domain/Project';
import { User } from 'user/domain/User';
import { DomainEvent } from 'event/domain/DomainEvent';

export class ProjectCreatedEvent extends DomainEvent {
  public readonly project: Project;
  public readonly owner: User;

  public constructor(project: Project, owner: User) {
    super();
    this.project = project;
    this.owner = owner;
  }
}
