import { ProjectEntity } from 'project/entities/project.entity';
import { UserEntity } from 'user';
import { Event } from 'event';

export class ProjectCreatedEvent extends Event {
  public readonly project: ProjectEntity;
  public readonly owner: UserEntity;

  public constructor(project: ProjectEntity, owner: UserEntity) {
    super();
    this.project = project;
    this.owner = owner;
  }
}
