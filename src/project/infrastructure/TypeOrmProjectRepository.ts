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
import { MilestoneTypeOrmEntity } from './MilestoneTypeOrmEntity';
import { RoleMetricTypeOrmEntity } from './RoleMetricTypeOrmEntity';

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
    // depends on milestones + review topics
    const peerReviewIdsToDelete = projectModels
      .flatMap((projectModel) => projectModel.peerReviews.getRemovedModels())
      .map((peerReviewModel) => peerReviewModel.id.value);
    if (peerReviewIdsToDelete.length > 0) {
      await this.entityManager.delete(
        PeerReviewTypeOrmEntity,
        peerReviewIdsToDelete,
      );
    }
    // depends on milestones + review topics
    const contributionIdsToDelete = projectModels
      .flatMap((projectModel) => projectModel.contributions.getRemovedModels())
      .map((contributionModel) => contributionModel.id.value);
    if (contributionIdsToDelete.length > 0) {
      await this.entityManager.delete(
        ContributionTypeOrmEntity,
        contributionIdsToDelete,
      );
    }
    // depends on roles + milestones + review topics
    const roleMetricIdsToDelete = projectModels
      .flatMap((projectModel) => projectModel.roleMetrics.getRemovedModels())
      .map((roleMetric) => roleMetric.id.value);
    if (roleMetricIdsToDelete.length > 0) {
      await this.entityManager.delete(
        RoleMetricTypeOrmEntity,
        roleMetricIdsToDelete,
      );
    }
    const roleIdsToDelete = projectModels
      .flatMap((projectModel) => projectModel.roles.getRemovedModels())
      .map((projectModel) => projectModel.id.value);
    if (roleIdsToDelete.length > 0) {
      await this.entityManager.delete(RoleTypeOrmEntity, roleIdsToDelete);
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
    const milestoneIdsToDelete = projectModels
      .flatMap((projectModel) => projectModel.milestones.getRemovedModels())
      .map((milestoneModel) => milestoneModel.id.value);
    if (milestoneIdsToDelete.length > 0) {
      await this.entityManager.delete(
        MilestoneTypeOrmEntity,
        milestoneIdsToDelete,
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
    if (projectEntities.length === 0) {
      return;
    }
    const ids = projectEntities.map((projectEntity) =>
      projectEntity.id.toString(),
    );
    const [
      roleEntities,
      reviewTopicEntities,
      peerReviewEntities,
      contributionEntities,
      roleMetricEntities,
      milestoneEntities,
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
      this.entityManager
        .getRepository(RoleMetricTypeOrmEntity)
        .find({ projectId: In(ids) }),
      this.entityManager
        .getRepository(MilestoneTypeOrmEntity)
        .find({ projectId: In(ids) }),
    ]);
    for (const projectEntity of projectEntities) {
      // TODO improve performance by using hash join
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
      projectEntity.roleMetrics = roleMetricEntities.filter(
        (roleMetricEntity) => projectEntity.id === roleMetricEntity.projectId,
      );
      projectEntity.milestones = milestoneEntities.filter(
        (milestoneEntity) => projectEntity.id === milestoneEntity.projectId,
      );
    }
  }
}
