import { RoleTypeOrmEntity } from 'project/infrastructure/RoleTypeOrmEntity';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';
import { RoleModel } from 'role/domain/RoleModel';
import { RoleRepository } from 'role/domain/RoleRepository';
import { RoleNotFoundException } from 'project/domain/exceptions/RoleNotFoundException';
import { RoleTypeOrmEntityMapperService } from 'role/infrastructure/RoleTypeOrmEntityMapperService';
import { SimpleTypeOrmRepository } from 'common/infrastructure/SimpleTypeOrmRepository';
import { ObjectType } from 'typeorm';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { Id } from 'common/domain/value-objects/Id';

/**
 * TypeOrm Role Repository
 */
@Injectable()
export class TypeOrmRoleRepository
  extends SimpleTypeOrmRepository<RoleModel, RoleTypeOrmEntity>
  implements RoleRepository {
  /**
   *
   */
  public constructor(
    databaseClient: DatabaseClientService,
    roleEntityMapper: RoleTypeOrmEntityMapperService,
  ) {
    super(databaseClient, roleEntityMapper);
  }

  /**
   *
   */
  public async findByProjectId(projectId: Id): Promise<RoleModel[]> {
    const roleEntities = await this.entityManager
      .getRepository(RoleTypeOrmEntity)
      .find({ projectId: projectId.value });
    const roleModels = roleEntities.map(e => this.entityMapper.toModel(e));
    return roleModels;
  }

  /**
   *
   */
  public async findByAssigneeId(assigneeId: Id): Promise<RoleModel[]> {
    const roleEntities = await this.entityManager
      .getRepository(RoleTypeOrmEntity)
      .find({ assigneeId: assigneeId.value });
    const roleModels = roleEntities.map(e => this.entityMapper.toModel(e));
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
  protected getEntityType(): ObjectType<ProjectTypeOrmEntity> {
    return RoleTypeOrmEntity;
  }
}
