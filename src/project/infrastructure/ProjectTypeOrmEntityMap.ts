import { Project } from 'project/domain/Project';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ProjectState } from 'project/domain/value-objects/states/ProjectState';
import { ContributionVisibility } from 'project/domain/value-objects/ContributionVisibility';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';
import { RoleTypeOrmEntity } from 'project/infrastructure/RoleTypeOrmEntity';
import { PeerReviewTypeOrmEntity } from 'project/infrastructure/PeerReviewTypeOrmEntity';
import { Role } from 'project/domain/Role';
import { PeerReview } from 'project/domain/PeerReview';
import { RoleCollection } from 'project/domain/RoleCollection';
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';
import { RoleTitle } from 'project/domain/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/value-objects/RoleDescription';
import { Contribution } from 'project/domain/value-objects/Contribution';
import { HasSubmittedPeerReviews } from 'project/domain/value-objects/HasSubmittedPeerReviews';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { RoleId } from 'project/domain/value-objects/RoleId';
import { ProjectId } from 'project/domain/value-objects/ProjectId';
import { UserId } from 'user/domain/value-objects/UserId';
import { PeerReviewId } from 'project/domain/value-objects/PeerReviewId';
import { Injectable, Type } from '@nestjs/common';
import { ProjectStateValue } from 'project/domain/value-objects/states/ProjectStateValue';
import { ProjectFormation } from 'project/domain/value-objects/states/ProjectFormation';
import { ProjectPeerReview } from 'project/domain/value-objects/states/ProjectPeerReview';
import { ProjectManagerReview } from 'project/domain/value-objects/states/ProjectManagerReview';
import { ProjectFinished } from 'project/domain/value-objects/states/ProjectFinished';
import { ProjectArchived } from 'project/domain/value-objects/states/ProjectArchived';
import { InvalidProjectStateException } from 'project/domain/exceptions/InvalidProjectStateException';

@Injectable()
export class ProjectTypeOrmEntityMap extends ObjectMap<
  Project,
  ProjectTypeOrmEntity
> {
  protected doMap(projectModel: Project): ProjectTypeOrmEntity {
    const roleEntities: RoleTypeOrmEntity[] = [];
    const peerReviewEntities: PeerReviewTypeOrmEntity[] = [];
    const projectEntity = new ProjectTypeOrmEntity(
      projectModel.id.value,
      projectModel.createdAt.value,
      projectModel.updatedAt.value,
      projectModel.title.value,
      projectModel.description.value,
      projectModel.creatorId.value,
      projectModel.state.value,
      projectModel.consensuality ? projectModel.consensuality.value : null,
      projectModel.contributionVisibility.value,
      projectModel.skipManagerReview.value,
      roleEntities,
      peerReviewEntities,
    );
    for (const role of projectModel.roles) {
      roleEntities.push(
        new RoleTypeOrmEntity(
          role.id.value,
          role.createdAt.value,
          role.updatedAt.value,
          projectEntity,
          role.assigneeId ? role.assigneeId.value : null,
          role.title.value,
          role.description.value,
          role.contribution ? role.contribution.value : null,
          role.hasSubmittedPeerReviews.value,
        ),
      );
    }
    for (const peerReview of projectModel.peerReviews) {
      peerReviewEntities.push(
        new PeerReviewTypeOrmEntity(
          peerReview.id.value,
          peerReview.createdAt.value,
          peerReview.updatedAt.value,
          projectEntity,
          peerReview.senderRoleId.value,
          peerReview.receiverRoleId.value,
          peerReview.score.value,
        ),
      );
    }
    return projectEntity;
  }

  public getSourceType(): Type<Project> {
    return Project;
  }

  public getTargetType(): Type<ProjectTypeOrmEntity> {
    return ProjectTypeOrmEntity;
  }
}

@Injectable()
export class ReverseProjectTypeOrmEntityMap extends ObjectMap<
  ProjectTypeOrmEntity,
  Project
> {
  protected doMap(projectEntity: ProjectTypeOrmEntity): Project {
    const roles = new RoleCollection(
      projectEntity.roles.map(
        (roleEntity) =>
          new Role(
            RoleId.from(roleEntity.id),
            CreatedAt.from(roleEntity.createdAt),
            UpdatedAt.from(roleEntity.updatedAt),
            ProjectId.from(projectEntity.id),
            roleEntity.assigneeId ? UserId.from(roleEntity.assigneeId) : null,
            RoleTitle.from(roleEntity.title),
            RoleDescription.from(roleEntity.description),
            roleEntity.contribution
              ? Contribution.from(roleEntity.contribution)
              : null,
            HasSubmittedPeerReviews.from(roleEntity.hasSubmittedPeerReviews),
          ),
      ),
    );
    const peerReviews = new PeerReviewCollection(
      projectEntity.peerReviews.map(
        (peerReviewEntity) =>
          new PeerReview(
            PeerReviewId.from(peerReviewEntity.id),
            CreatedAt.from(peerReviewEntity.createdAt),
            UpdatedAt.from(peerReviewEntity.updatedAt),
            RoleId.from(peerReviewEntity.senderRoleId),
            RoleId.from(peerReviewEntity.receiverRoleId),
            PeerReviewScore.from(peerReviewEntity.score),
          ),
      ),
    );
    return new Project(
      ProjectId.from(projectEntity.id),
      CreatedAt.from(projectEntity.createdAt),
      UpdatedAt.from(projectEntity.updatedAt),
      ProjectTitle.from(projectEntity.title),
      ProjectDescription.from(projectEntity.description),
      UserId.from(projectEntity.creatorId),
      this.mapProjectState(projectEntity.state),
      projectEntity.consensuality
        ? Consensuality.from(projectEntity.consensuality)
        : null,
      ContributionVisibility.from(projectEntity.contributionVisibility),
      SkipManagerReview.from(projectEntity.skipManagerReview),
      roles,
      peerReviews,
    );
  }

  private mapProjectState(projectStateValue: ProjectStateValue): ProjectState {
    switch (projectStateValue) {
      case ProjectStateValue.FORMATION: {
        return ProjectFormation.getInstance();
      }
      case ProjectStateValue.PEER_REVIEW: {
        return ProjectPeerReview.getInstance();
      }
      case ProjectStateValue.MANAGER_REVIEW: {
        return ProjectManagerReview.getInstance();
      }
      case ProjectStateValue.FINISHED: {
        return ProjectFinished.getInstance();
      }
      case ProjectStateValue.ARCHIVED: {
        return ProjectArchived.getInstance();
      }
      default: {
        throw new InvalidProjectStateException();
      }
    }
  }

  public getSourceType(): Type<ProjectTypeOrmEntity> {
    return ProjectTypeOrmEntity;
  }

  public getTargetType(): Type<Project> {
    return Project;
  }
}
