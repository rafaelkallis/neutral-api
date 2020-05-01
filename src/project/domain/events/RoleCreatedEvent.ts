import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { RoleId } from 'project/domain/role/value-objects/RoleId';

@DomainEventKey('project.role_created')
export class RoleCreatedEvent extends DomainEvent {
  public readonly projectId: ProjectId;
  public readonly roleId: RoleId;

  public constructor(projecId: ProjectId, roleId: RoleId) {
    super();
    this.projectId = projecId;
    this.roleId = roleId;
  }
}
