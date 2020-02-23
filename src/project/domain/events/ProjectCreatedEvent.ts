import { Project } from 'project/domain/Project';
import { User } from 'user/domain/User';
import { AbstractEvent } from 'event/abstract.event';

export class ProjectCreatedEvent extends AbstractEvent {
  public readonly project: Project;
  public readonly owner: User;

  public constructor(project: Project, owner: User) {
    super();
    this.project = project;
    this.owner = owner;
  }
}
