import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { Project } from 'project/domain/project/Project';
import { RoleTypeOrmEntity } from 'project/infrastructure/RoleTypeOrmEntity';
import { PeerReviewTypeOrmEntity } from 'project/infrastructure/PeerReviewTypeOrmEntity';
import { ReviewTopicTypeOrmEntity } from 'project/infrastructure/ReviewTopicTypeOrmEntity';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { UserId } from 'user/domain/value-objects/UserId';
import { Injectable } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { TypeOrmRepository } from 'shared/typeorm/TypeOrmRepository';
import { ContributionTypeOrmEntity } from './ContributionTypeOrmEntity';

/**
 * TypeOrm Project Repository
 */
@Injectable()
export class TypeOrmProjectRepository extends ProjectRepository {
  private readonly entityManager: EntityManager;
  private readonly typeOrmRepository: TypeOrmRepository<
    ProjectTypeOrmEntity,
    ProjectId,
    Project
  >;
  private readonly objectMapper: ObjectMapper;
  /**
   *
   */
  public constructor(
    typeOrmClient: TypeOrmClient,
    objectMapper: ObjectMapper,
    typeOrmRepository: TypeOrmRepository<
      ProjectTypeOrmEntity,
      ProjectId,
      Project
    >,
  ) {
    super();
    this.entityManager = typeOrmClient.entityManager;
    this.typeOrmRepository = typeOrmRepository;
    this.objectMapper = objectMapper;
  }

  public async findPage(afterId?: ProjectId | undefined): Promise<Project[]> {
    return this.typeOrmRepository.findPage(
      ProjectTypeOrmEntity,
      Project,
      afterId,
    );
  }

  public async findById(id: ProjectId): Promise<Project | undefined> {
    const [project] = await this.findByIds([id]);
    return project;
  }

  public async findByIds(ids: ProjectId[]): Promise<(Project | undefined)[]> {
    const projectEntities = await this.entityManager
      .getRepository(ProjectTypeOrmEntity)
      .find({ id: In(ids.map((id) => id.toString())) });
    await this.loadRelations(projectEntities);
    const projectModels = await this.objectMapper.mapIterable(
      projectEntities,
      Project,
    );
    return ids.map((id) =>
      projectModels.find((projectModel) => projectModel.id.equals(id)),
    );
  }

  protected async doPersist(...projectModels: Project[]): Promise<void> {
    // TypeOrm does not delete removed one-to-many models, have to manually delete
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
    const reviewTopicIdsToDelete = projectModels
      .flatMap((projectModel) => projectModel.reviewTopics.getRemovedModels())
      .map((reviewTopicModel) => reviewTopicModel.id.value);
    if (reviewTopicIdsToDelete.length > 0) {
      await this.entityManager.delete(
        ReviewTopicTypeOrmEntity,
        reviewTopicIdsToDelete,
      );
    }
    const contributionIdsToDelete = projectModels
      .flatMap((projectModel) => projectModel.contributions.getRemovedModels())
      .map((contributionModel) => contributionModel.id.value);
    if (contributionIdsToDelete.length > 0) {
      await this.entityManager.delete(
        ContributionTypeOrmEntity,
        contributionIdsToDelete,
      );
    }
    await this.typeOrmRepository.persist(
      ProjectTypeOrmEntity,
      ...projectModels,
    );
  }

  public async findByCreatorId(creatorId: UserId): Promise<Project[]> {
    const projectEntities = await this.entityManager
      .getRepository(ProjectTypeOrmEntity)
      .createQueryBuilder('project')
      .where('project.creatorId = :creatorId')
      .setParameter('creatorId', creatorId.toString())
      .getMany();
    await this.loadRelations(projectEntities);
    const projectModels = this.objectMapper.mapIterable(
      projectEntities,
      Project,
    );
    return projectModels;
  }

  public async findByRoleAssigneeId(assigneeId: UserId): Promise<Project[]> {
    const projectEntities = await this.entityManager
      .getRepository(ProjectTypeOrmEntity)
      .createQueryBuilder('project')
      .leftJoin('project.roles', 'role')
      .where('role.assigneeId = :assigneeId')
      .setParameter('assigneeId', assigneeId.value)
      .getMany();
    await this.loadRelations(projectEntities);
    const projectModels = this.objectMapper.mapIterable(
      projectEntities,
      Project,
    );
    return projectModels;
  }

  private async loadRelations(
    projectEntities: readonly ProjectTypeOrmEntity[],
  ): Promise<void> {
    const ids = projectEntities.map((projectEntity) =>
      projectEntity.id.toString(),
    );
    const [
      roleEntities,
      reviewTopicEntities,
      peerReviewEntities,
      contributionEntities,
    ] = await Promise.all([
      this.entityManager
        .getRepository(RoleTypeOrmEntity)
        .find({ projectId: In(ids) }),
      this.entityManager
        .getRepository(ReviewTopicTypeOrmEntity)
        .find({ projectId: In(ids) }),
      this.entityManager
        .getRepository(PeerReviewTypeOrmEntity)
        .find({ projectId: In(ids) }),
      this.entityManager
        .getRepository(ContributionTypeOrmEntity)
        .find({ projectId: In(ids) }),
    ]);
    for (const projectEntity of projectEntities) {
      projectEntity.roles = roleEntities.filter(
        (roleEntity) => projectEntity.id === roleEntity.projectId,
      );
      projectEntity.reviewTopics = reviewTopicEntities.filter(
        (reviewTopicEntity) => projectEntity.id === reviewTopicEntity.projectId,
      );
      projectEntity.peerReviews = peerReviewEntities.filter(
        (peerReviewEntity) => projectEntity.id === peerReviewEntity.projectId,
      );
      projectEntity.contributions = contributionEntities.filter(
        (contributionEntity) =>
          projectEntity.id === contributionEntity.projectId,
      );
    }
  }
}
