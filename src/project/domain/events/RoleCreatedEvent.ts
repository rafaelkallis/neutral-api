import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { Id } from 'shared/domain/value-objects/Id';

@DomainEventKey('project.role_created')
export class RoleCreatedEvent extends DomainEvent {
  public readonly projectId: Id;
  public readonly roleId: Id;

  public constructor(projecId: Id, roleId: Id) {
    super();
    this.projectId = projecId;
    this.roleId = roleId;
  }
}
