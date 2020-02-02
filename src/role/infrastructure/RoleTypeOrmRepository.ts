import { TypeOrmRepository } from 'common';
import { RoleTypeOrmEntity } from 'role/infrastructure/RoleTypeOrmEntity';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';
import { RoleModel } from 'role/domain/RoleModel';
import { RoleRepository } from 'role/domain/RoleRepository';
import { RoleNotFoundException } from 'role/application/exceptions/RoleNotFoundException';

/**
 * TypeOrm Role Repository
 */
@Injectable()
export class TypeOrmRoleRepository
  extends TypeOrmRepository<RoleModel, RoleTypeOrmEntity>
  implements RoleRepository {
  /**
   *
   */
  public constructor(databaseClient: DatabaseClientService) {
    super(databaseClient, RoleTypeOrmEntity);
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
  protected toModel(roleTypeOrmEntity: RoleTypeOrmEntity): RoleModel {
    return new RoleModel(
      roleTypeOrmEntity.id,
      roleTypeOrmEntity.createdAt,
      roleTypeOrmEntity.updatedAt,
      roleTypeOrmEntity.projectId,
      roleTypeOrmEntity.assigneeId,
      roleTypeOrmEntity.title,
      roleTypeOrmEntity.description,
      roleTypeOrmEntity.contribution,
      roleTypeOrmEntity.hasSubmittedPeerReviews,
    );
  }

  /**
   *
   */
  protected toEntity(roleModel: RoleModel): RoleTypeOrmEntity {
    return new RoleTypeOrmEntity(
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
