import { FakeRepository } from 'common';
import { RoleEntity } from 'role/entities/role.entity';
import { Role } from 'role/role';

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
}
