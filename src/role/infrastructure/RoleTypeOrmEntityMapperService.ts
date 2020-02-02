import { Injectable } from '@nestjs/common';
import { TypeOrmEntityMapperService } from 'common/infrastructure/TypeOrmEntityMapperService';
import { RoleModel } from 'role/domain/RoleModel';
import { RoleTypeOrmEntity } from 'role/infrastructure/RoleTypeOrmEntity';

/**
 * Role TypeOrm Entity Mapper
 */
@Injectable()
export class RoleTypeOrmEntityMapperService
  implements TypeOrmEntityMapperService<RoleModel, RoleTypeOrmEntity> {
  /**
   *
   */
  public toModel(roleEntity: RoleTypeOrmEntity): RoleModel {
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
  public toEntity(roleModel: RoleModel): RoleTypeOrmEntity {
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
