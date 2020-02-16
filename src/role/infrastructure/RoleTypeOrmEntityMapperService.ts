import { Injectable } from '@nestjs/common';
import { TypeOrmEntityMapperService } from 'common/infrastructure/TypeOrmEntityMapperService';
import { RoleModel } from 'role/domain/RoleModel';
import { RoleTypeOrmEntity } from 'project/infrastructure/RoleTypeOrmEntity';
import { Id } from 'common/domain/value-objects/Id';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';

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
      Id.from(roleEntity.id),
      CreatedAt.from(roleEntity.createdAt),
      UpdatedAt.from(roleEntity.updatedAt),
      Id.from(roleEntity.projectId),
      roleEntity.assigneeId ? Id.from(roleEntity.assigneeId) : null,
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
      roleModel.id.value,
      roleModel.createdAt.value,
      roleModel.updatedAt.value,
      roleModel.projectId.value,
      roleModel.assigneeId ? roleModel.assigneeId.value : null,
      roleModel.title,
      roleModel.description,
      roleModel.contribution,
      roleModel.hasSubmittedPeerReviews,
    );
  }
}
