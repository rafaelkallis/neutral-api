import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Injectable } from '@nestjs/common';
import { Role } from 'project/domain/role/Role';
import { RoleTypeOrmEntity } from './RoleTypeOrmEntity';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { UserId } from 'user/domain/value-objects/UserId';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';

@Injectable()
@ObjectMap.register(Role, RoleTypeOrmEntity)
export class RoleTypeOrmEntityMap extends ObjectMap<Role, RoleTypeOrmEntity> {
  protected doMap(roleModel: Role, ctx: ObjectMapContext): RoleTypeOrmEntity {
    const project = ctx.get('project', ProjectTypeOrmEntity);
    return new RoleTypeOrmEntity(
      roleModel.id.value,
      roleModel.createdAt.value,
      roleModel.updatedAt.value,
      project.id,
      roleModel.assigneeId ? roleModel.assigneeId.value : null,
      roleModel.title.value,
      roleModel.description.value,
    );
  }
}

@Injectable()
@ObjectMap.register(RoleTypeOrmEntity, Role)
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
    );
  }
}
