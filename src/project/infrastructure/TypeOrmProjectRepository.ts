import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { Project } from 'project/domain/project/Project';
import { RoleTypeOrmEntity } from 'project/infrastructure/RoleTypeOrmEntity';
import { PeerReviewTypeOrmEntity } from 'project/infrastructure/PeerReviewTypeOrmEntity';
import { ReviewTopicTypeOrmEntity } from 'project/infrastructure/ReviewTopicTypeOrmEntity';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { Repository } from 'shared/domain/Repository';
import { UserId } from 'user/domain/value-objects/UserId';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';

/**
 * TypeOrm Project Repository
 */
@Injectable()
export class TypeOrmProjectRepository extends ProjectRepository {
  private readonly typeOrmClient: TypeOrmClient;
  private readonly typeOrmRepository: Repository<ProjectId, Project>;
  private readonly objectMapper: ObjectMapper;
  /**
   *
   */
  public constructor(typeOrmClient: TypeOrmClient, objectMapper: ObjectMapper) {
    super();
    this.typeOrmClient = typeOrmClient;
    this.typeOrmRepository = this.typeOrmClient.createRepository(
      Project,
      ProjectTypeOrmEntity,
    );
    this.objectMapper = objectMapper;
  }
  public async findPage(afterId?: ProjectId | undefined): Promise<Project[]> {
    return this.typeOrmRepository.findPage(afterId);
  }

  public async findById(id: ProjectId): Promise<Project | undefined> {
    return this.typeOrmRepository.findById(id);
  }

  public async findByIds(ids: ProjectId[]): Promise<(Project | undefined)[]> {
    return this.typeOrmRepository.findByIds(ids);
  }

  public async exists(id: ProjectId): Promise<boolean> {
    return this.typeOrmRepository.exists(id);
  }

  protected async doPersist(...projectModels: Project[]): Promise<void> {
    // TypeOrm does not delete removed one-to-many models, have to manually delete
    const roleIdsToDelete = projectModels
      .flatMap((projectModel) => projectModel.roles.getRemovedModels())
      .map((projectModel) => projectModel.id.value);
    if (roleIdsToDelete.length > 0) {
      await this.typeOrmClient.entityManager.delete(
        RoleTypeOrmEntity,
        roleIdsToDelete,
      );
    }
    const peerReviewIdsToDelete = projectModels
      .flatMap((projectModel) => projectModel.peerReviews.getRemovedModels())
      .map((peerReviewModel) => peerReviewModel.id.value);
    if (peerReviewIdsToDelete.length > 0) {
      await this.typeOrmClient.entityManager.delete(
        PeerReviewTypeOrmEntity,
        peerReviewIdsToDelete,
      );
    }
    const reviewTopicIdsToDelete = projectModels
      .flatMap((projectModel) => projectModel.reviewTopics.getRemovedModels())
      .map((reviewTopicModel) => reviewTopicModel.id.value);
    if (reviewTopicIdsToDelete.length > 0) {
      await this.typeOrmClient.entityManager.delete(
        ReviewTopicTypeOrmEntity,
        reviewTopicIdsToDelete,
      );
    }
    await this.typeOrmRepository.persist(...projectModels);
  }

  public async findByCreatorId(creatorId: UserId): Promise<Project[]> {
    const projectEntities = await this.typeOrmClient.entityManager
      .getRepository(ProjectTypeOrmEntity)
      .find({ creatorId: creatorId.value });
    const projectModels = this.objectMapper.mapArray(projectEntities, Project);
    return projectModels;
  }

  public async findByRoleId(roleId: RoleId): Promise<Project | undefined> {
    const projectEntity = await this.createProjectQueryBuilder()
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
      return undefined;
    }
    return this.objectMapper.map(projectEntity, Project);
  }

  public async findByRoleAssigneeId(assigneeId: UserId): Promise<Project[]> {
    const projectEntities = await this.createProjectQueryBuilder()
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
    const projectModels = this.objectMapper.mapArray(projectEntities, Project);
    return projectModels;
  }

  private createProjectQueryBuilder(): SelectQueryBuilder<
    ProjectTypeOrmEntity
  > {
    return this.typeOrmClient.entityManager
      .getRepository(ProjectTypeOrmEntity)
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.roles', 'role')
      .leftJoinAndSelect('project.peerReviews', 'peerReview')
      .leftJoinAndSelect('project.reviewTopics', 'reviewTopic');
  }
}