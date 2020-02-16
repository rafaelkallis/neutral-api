import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { ProjectModel } from 'project/domain/ProjectModel';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { ProjectTypeOrmEntityMapperService } from 'project/infrastructure/ProjectTypeOrmEntityMapperService';
import { ObjectType, In } from 'typeorm';
import { Id } from 'common/domain/value-objects/Id';
import { RoleTypeOrmEntity } from 'project/infrastructure/RoleTypeOrmEntity';
import { RoleModel } from 'role';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { TypeOrmRepository } from 'common/infrastructure/TypeOrmRepository';

/**
 * Project TypeOrm Repository
 */
@Injectable()
export class ProjectTypeOrmRepository extends TypeOrmRepository<ProjectModel>
  implements ProjectRepository {
  private entityMapper: ProjectTypeOrmEntityMapperService;
  /**
   *
   */
  public constructor(
    databaseClient: DatabaseClientService,
    entityMapper: ProjectTypeOrmEntityMapperService,
  ) {
    super(databaseClient);
    this.entityMapper = entityMapper;
  }

  public async findByCreatorId(creatorId: Id): Promise<ProjectModel[]> {
    const projectEntities = await this.entityManager
      .getRepository(ProjectTypeOrmEntity)
      .find({
        creatorId: creatorId.value,
      });
    const projectIds = projectEntities.map(p => p.id);
    const roleEntities = await this.entityManager
      .getRepository(RoleTypeOrmEntity)
      .find({ projectId: In(projectIds) });
    const projectModels = projectEntities.map(projectEntity => {
      const roleEntitiesOfProject = roleEntities.filter(
        roleEntity => roleEntity.projectId === projectEntity.id,
      );
      return this.entityMapper.toModel(projectEntity, roleEntitiesOfProject);
    });
    return projectModels;
  }

  public async findByRoleId(roleId: Id): Promise<ProjectModel> {
    const projectEntity = await this.entityManager
      .getRepository(ProjectTypeOrmEntity)
      .createQueryBuilder('project')
      .innerJoin(RoleTypeOrmEntity, 'role', 'role.project_id = project.id')
      .where('role.id = :roleId', { roleId: roleId.value })
      .getOne();
    if (!projectEntity) {
      throw new ProjectNotFoundException();
    }
    const roleEntities = await this.entityManager
      .getRepository(RoleTypeOrmEntity)
      .find({ projectId: projectEntity.id });
    const projectModel = this.entityMapper.toModel(projectEntity, roleEntities);
    return projectModel;
  }
}
