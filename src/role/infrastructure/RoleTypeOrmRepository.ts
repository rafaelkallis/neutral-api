import { TypeOrmRepository } from 'common';
import { RoleTypeOrmEntity } from 'role/infrastructure/RoleTypeOrmEntity';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';
import { RoleModel } from 'role/domain/RoleModel';
import { RoleRepository } from 'role/domain/RoleRepository';
import { RoleNotFoundException } from 'role/application/exceptions/RoleNotFoundException';
import { RoleTypeOrmEntityMapperService } from 'role/infrastructure/RoleTypeOrmEntityMapperService';

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
  public constructor(
    databaseClient: DatabaseClientService,
    roleEntityMapper: RoleTypeOrmEntityMapperService,
  ) {
    super(databaseClient, RoleTypeOrmEntity, roleEntityMapper);
  }

  /**
   *
   */
  public async findByProjectId(projectId: string): Promise<RoleModel[]> {
    const roleEntities = await this.internalRepository.find({ projectId });
    const roleModels = roleEntities.map(e => this.entityMapper.toModel(e));
    return roleModels;
  }

  /**
   *
   */
  public async findByAssigneeId(assigneeId: string): Promise<RoleModel[]> {
    const roleEntities = await this.internalRepository.find({ assigneeId });
    const roleModels = roleEntities.map(e => this.entityMapper.toModel(e));
    return roleModels;
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new RoleNotFoundException();
  }
}
