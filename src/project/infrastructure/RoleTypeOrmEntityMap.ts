import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Injectable, Type } from '@nestjs/common';
import { Role } from 'project/domain/Role';
import { RoleTypeOrmEntity } from './RoleTypeOrmEntity';
import { RoleId } from 'project/domain/value-objects/RoleId';
import { UserId } from 'user/domain/value-objects/UserId';
import { RoleTitle } from 'project/domain/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/value-objects/RoleDescription';
import { Contribution } from 'project/domain/value-objects/Contribution';
import { HasSubmittedPeerReviews } from 'project/domain/value-objects/HasSubmittedPeerReviews';

@Injectable()
export class RoleTypeOrmEntityMap extends ObjectMap<Role, RoleTypeOrmEntity> {
  protected doMap(roleModel: Role, ctx: ObjectMapContext): RoleTypeOrmEntity {
    return new RoleTypeOrmEntity(
      roleModel.id.value,
      roleModel.createdAt.value,
      roleModel.updatedAt.value,
      ctx.get('project', ProjectTypeOrmEntity),
      roleModel.assigneeId ? roleModel.assigneeId.value : null,
      roleModel.title.value,
      roleModel.description.value,
      roleModel.contribution ? roleModel.contribution.value : null,
      roleModel.hasSubmittedPeerReviews.value,
    );
  }

  public getSourceType(): Type<Role> {
    return Role;
  }

  public getTargetType(): Type<RoleTypeOrmEntity> {
    return RoleTypeOrmEntity;
  }
}

@Injectable()
export class ReverseRoleTypeOrmEntityMap extends ObjectMap<
  RoleTypeOrmEntity,
  Role
> {
  protected doMap(roleEntity: RoleTypeOrmEntity): Role {
    return new Role(
      RoleId.from(roleEntity.id),
      CreatedAt.from(roleEntity.createdAt),
      UpdatedAt.from(roleEntity.updatedAt),
      roleEntity.assigneeId ? UserId.from(roleEntity.assigneeId) : null,
      RoleTitle.from(roleEntity.title),
      RoleDescription.from(roleEntity.description),
      roleEntity.contribution
        ? Contribution.from(roleEntity.contribution)
        : null,
      HasSubmittedPeerReviews.from(roleEntity.hasSubmittedPeerReviews),
    );
  }

  public getSourceType(): Type<RoleTypeOrmEntity> {
    return RoleTypeOrmEntity;
  }

  public getTargetType(): Type<Role> {
    return Role;
  }
}
