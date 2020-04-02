import { Project } from 'project/domain/Project';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
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
import { ObjectMap, AbstractObjectMap } from 'shared/object-mapper/ObjectMap';

@ObjectMap(Project, ProjectTypeOrmEntity)
export class ProjectTypeOrmEntityMap extends AbstractObjectMap<
  Project,
  ProjectTypeOrmEntity
> {
  protected innerMap(projectModel: Project): ProjectTypeOrmEntity {
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
}

@ObjectMap(ProjectTypeOrmEntity, Project)
export class ReverseProjectTypeOrmEntityMap extends AbstractObjectMap<
  ProjectTypeOrmEntity,
  Project
> {
  protected innerMap(projectEntity: ProjectTypeOrmEntity): Project {
    const roles = new RoleCollection(
      projectEntity.roles.map(
        (roleEntity) =>
          new Role(
            Id.from(roleEntity.id),
            CreatedAt.from(roleEntity.createdAt),
            UpdatedAt.from(roleEntity.updatedAt),
            Id.from(projectEntity.id),
            roleEntity.assigneeId ? Id.from(roleEntity.assigneeId) : null,
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
            Id.from(peerReviewEntity.id),
            CreatedAt.from(peerReviewEntity.createdAt),
            UpdatedAt.from(peerReviewEntity.updatedAt),
            Id.from(peerReviewEntity.senderRoleId),
            Id.from(peerReviewEntity.receiverRoleId),
            PeerReviewScore.from(peerReviewEntity.score),
          ),
      ),
    );
    return new Project(
      Id.from(projectEntity.id),
      CreatedAt.from(projectEntity.createdAt),
      UpdatedAt.from(projectEntity.updatedAt),
      ProjectTitle.from(projectEntity.title),
      ProjectDescription.from(projectEntity.description),
      Id.from(projectEntity.creatorId),
      ProjectState.from(projectEntity.state),
      projectEntity.consensuality
        ? Consensuality.from(projectEntity.consensuality)
        : null,
      ContributionVisibility.from(projectEntity.contributionVisibility),
      SkipManagerReview.from(projectEntity.skipManagerReview),
      roles,
      peerReviews,
    );
  }
}
