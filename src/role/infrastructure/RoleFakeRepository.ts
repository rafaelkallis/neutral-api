import { FakeRepository } from 'common';
import { RoleModel } from 'role/domain/RoleModel';
import { RoleNotFoundException } from 'role/application/exceptions/RoleNotFoundException';

/**
 * Fake Role Repository
 */
export class FakeRoleRepository extends FakeRepository<RoleModel> {
  /**
   *
   */
  public async findByProjectId(projectId: string): Promise<RoleModel[]> {
    return Array.from(this.entities.values()).filter(
      role => role.projectId === projectId,
    );
  }

  /**
   *
   */
  public async findByAssigneeId(assigneeId: string): Promise<RoleModel[]> {
    return Array.from(this.entities.values()).filter(
      role => role.assigneeId === assigneeId,
    );
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new RoleNotFoundException();
  }
}
