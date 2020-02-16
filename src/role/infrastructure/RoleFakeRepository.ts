import { RoleModel } from 'role/domain/RoleModel';
import { RoleNotFoundException } from 'project/domain/exceptions/RoleNotFoundException';
import { MemoryRepository } from 'common/infrastructure/MemoryRepository';
import { Id } from 'common/domain/value-objects/Id';

/**
 * Fake Role Repository
 */
export class FakeRoleRepository extends MemoryRepository<RoleModel> {
  /**
   *
   */
  public async findByProjectId(projectId: Id): Promise<RoleModel[]> {
    return Array.from(this.models.values()).filter(role =>
      role.projectId.equals(projectId),
    );
  }

  /**
   *
   */
  public async findByAssigneeId(assigneeId: Id): Promise<RoleModel[]> {
    return Array.from(this.models.values()).filter(role =>
      role.assigneeId ? role.assigneeId.equals(assigneeId) : false,
    );
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new RoleNotFoundException();
  }
}
