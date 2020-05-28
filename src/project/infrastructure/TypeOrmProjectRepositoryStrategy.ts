import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { Project } from 'project/domain/project/Project';
import { RoleTypeOrmEntity } from 'project/infrastructure/RoleTypeOrmEntity';
import { PeerReviewTypeOrmEntity } from 'project/infrastructure/PeerReviewTypeOrmEntity';
import { ReviewTopicTypeOrmEntity } from 'project/infrastructure/ReviewTopicTypeOrmEntity';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { UserId } from 'user/domain/value-objects/UserId';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { Injectable, Type } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { TypeOrmRepositoryStrategy } from 'shared/typeorm/TypeOrmRepositoryStrategy';
import { ProjectRepositoryStrategy } from 'project/domain/project/ProjectRepositoryStrategy';

@Injectable()
export class TypeOrmProjectRepositoryStrategy
  extends TypeOrmRepositoryStrategy<ProjectId, Project, ProjectTypeOrmEntity>
  implements ProjectRepositoryStrategy {
  public constructor(typeOrmClient: TypeOrmClient, objectMapper: ObjectMapper) {
    super(typeOrmClient.entityManager, objectMapper);
  }

  protected getModelType(): Type<Project> {
    return Project;
  }
  protected getEntityType(): Type<ProjectTypeOrmEntity> {
    return ProjectTypeOrmEntity;
  }

  public async persist(...projectModels: Project[]): Promise<void> {
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
    await super.persist(...projectModels);
  }

  public async findByCreatorId(creatorId: UserId): Promise<Project[]> {
    const projectEntities = await this.entityManager
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
    return this.entityManager
      .getRepository(ProjectTypeOrmEntity)
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.roles', 'role')
      .leftJoinAndSelect('project.peerReviews', 'peerReview')
      .leftJoinAndSelect('project.reviewTopics', 'reviewTopic')
      .leftJoinAndSelect('project.contributions', 'contribution');
  }
}
