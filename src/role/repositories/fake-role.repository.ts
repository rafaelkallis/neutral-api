import { FakeRepository } from 'common';
import { RoleEntity } from 'role/entities/role.entity';

/**
 * Fake Role Repository
 */
export class FakeRoleRepository extends FakeRepository<RoleEntity> {
  /**
   *
   */
  public async findByProjectId(projectId: string): Promise<RoleEntity[]> {
    return Array.from(this.entities.values()).filter(
      role => role.projectId === projectId,
    );
  }

  /**
   *
   */
  public async findByAssigneeId(assigneeId: string): Promise<RoleEntity[]> {
    return Array.from(this.entities.values()).filter(
      role => role.assigneeId === assigneeId,
    );
  }
}
