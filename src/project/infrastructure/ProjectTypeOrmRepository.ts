import {
  AbstractTypeOrmRepository,
  TypeOrmRepository,
} from 'shared/infrastructure/TypeOrmRepository';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { DatabaseClientService } from 'shared/database/DatabaseClientService';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { Project } from 'project/domain/Project';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { Id } from 'shared/domain/value-objects/Id';
import { RoleTypeOrmEntity } from 'project/infrastructure/RoleTypeOrmEntity';
import { PeerReviewTypeOrmEntity } from 'project/infrastructure/PeerReviewTypeOrmEntity';
import { ModelMapper } from 'shared/model-mapper/ModelMapper';

/**
 * Project TypeOrm Repository
 */
@TypeOrmRepository(Project, ProjectTypeOrmEntity)
export class ProjectTypeOrmRepository
  extends AbstractTypeOrmRepository<Project, ProjectTypeOrmEntity>
  implements ProjectRepository {
  /**
   *
   */
  public constructor(
    databaseClient: DatabaseClientService,
    modelMapper: ModelMapper,
  ) {
    super(databaseClient, modelMapper);
  }

  public async persist(...projectModels: Project[]): Promise<void> {
    const roleIdsToDelete = projectModels
      .flatMap((projectModel) => projectModel.roles.getRemovedModels())
      .map((projectModel) => projectModel.id.value);
    if (roleIdsToDelete.length > 0) {
      await this.entityManager.delete(RoleTypeOrmEntity, roleIdsToDelete);
    }
    const peerReviewIdsToDelete = projectModels
      .flatMap((projectModel) => projectModel.peerReviews.getRemovedModels())
      .map((peerReviewModel) => peerReviewModel.id.value);
    if (peerReviewIdsToDelete.length > 0) {
      await this.entityManager.delete(
        PeerReviewTypeOrmEntity,
        peerReviewIdsToDelete,
      );
    }
    await super.persist(...projectModels);
  }

  public async findByCreatorId(creatorId: Id): Promise<Project[]> {
    const projectEntities = await this.entityManager
      .getRepository(ProjectTypeOrmEntity)
      .find({ creatorId: creatorId.value });
    const projectModels = projectEntities.map((p) =>
      this.modelMapper.map(p, Project),
    );
    return projectModels;
  }

  public async findByRoleId(roleId: Id): Promise<Project> {
    const projectEntity = await this.entityManager
      .getRepository(ProjectTypeOrmEntity)
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.roles', 'role')
      .leftJoinAndSelect('project.peerReviews', 'peerReview')
      .where((builder) => {
        const subQuery = builder
          .subQuery()
          .select('project.id')
          .from(ProjectTypeOrmEntity, 'project')
          .leftJoin('project.roles', 'role')
          .where('role.id = :roleId')
          .getQuery();
        return `project.id IN ${subQuery}`;
      })
      .setParameter('roleId', roleId.value)
      .getOne();
    if (!projectEntity) {
      this.throwEntityNotFoundException();
    }
    const projectModel = this.modelMapper.map(projectEntity, Project);
    return projectModel;
  }

  public async findByRoleAssigneeId(assigneeId: Id): Promise<Project[]> {
    const projectEntities = await this.entityManager
      .getRepository(ProjectTypeOrmEntity)
      .createQueryBuilder('project')
      .leftJoinAndSelect('role', 'role.project_id = project.id')
      .leftJoinAndSelect('project.peerReviews', 'peerReview')
      .where((builder) => {
        const subQuery = builder
          .subQuery()
          .select('project.id')
          .from(ProjectTypeOrmEntity, 'project')
          .leftJoin('project.roles', 'role')
          .where('role.assigneeId = :assigneeId')
          .getQuery();
        return `project.id IN ${subQuery}`;
      })
      .setParameter('assigneeId', assigneeId.value)
      .getMany();
    const projectModels = projectEntities.map((p) =>
      this.modelMapper.map(p, Project),
    );
    return projectModels;
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new ProjectNotFoundException();
  }
}
