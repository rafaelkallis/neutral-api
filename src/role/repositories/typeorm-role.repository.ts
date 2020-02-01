import { TypeOrmRepository } from 'common';
import { RoleEntity } from 'role/entities/role.entity';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';
import { RoleModel } from 'role/role.model';
import { RoleRepository } from 'role/repositories/role.repository';
import { RoleNotFoundException } from 'role/exceptions/role-not-found.exception';

/**
 * TypeOrm Role Repository
 */
@Injectable()
export class TypeOrmRoleRepository
  extends TypeOrmRepository<RoleModel, RoleEntity>
  implements RoleRepository {
  /**
   *
   */
  public constructor(databaseClient: DatabaseClientService) {
    super(databaseClient, RoleEntity);
  }

  /**
   *
   */
  public async findByProjectId(projectId: string): Promise<RoleModel[]> {
    const roleEntities = await this.internalRepository.find({ projectId });
    const roleModels = roleEntities.map(e => this.toModel(e));
    return roleModels;
  }

  /**
   *
   */
  public async findByAssigneeId(assigneeId: string): Promise<RoleModel[]> {
    const roleEntities = await this.internalRepository.find({ assigneeId });
    const roleModels = roleEntities.map(e => this.toModel(e));
    return roleModels;
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new RoleNotFoundException();
  }

  /**
   *
   */
  protected toModel(roleEntity: RoleEntity): RoleModel {
    return new RoleModel(
      roleEntity.id,
      roleEntity.createdAt,
      roleEntity.updatedAt,
      roleEntity.projectId,
      roleEntity.assigneeId,
      roleEntity.title,
      roleEntity.description,
      roleEntity.contribution,
      roleEntity.hasSubmittedPeerReviews,
    );
  }

  /**
   *
   */
  protected toEntity(roleModel: RoleModel): RoleEntity {
    return new RoleEntity(
      roleModel.id,
      roleModel.createdAt,
      roleModel.updatedAt,
      roleModel.projectId,
      roleModel.assigneeId,
      roleModel.title,
      roleModel.description,
      roleModel.contribution,
      roleModel.hasSubmittedPeerReviews,
    );
  }
}
