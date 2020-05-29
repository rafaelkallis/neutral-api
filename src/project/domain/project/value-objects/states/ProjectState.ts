import { OperationNotSupportedByCurrentProjectStateException } from 'project/domain/exceptions/OperationNotSupportedByCurrentProjectStateException';
import { Project } from 'project/domain/project/Project';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/project/value-objects/ProjectDescription';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { ReadonlyRole } from 'project/domain/role/Role';
import { ReadonlyUser } from 'user/domain/User';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { ReadonlyUserCollection } from 'user/domain/UserCollection';
import { CliquismComputer } from 'project/domain/CliquismComputer';

/**
 *
 */
export abstract class ProjectState extends ValueObject {
  public abstract update(
    project: Project,
    title?: ProjectTitle,
    description?: ProjectDescription,
  ): void;

  public abstract addRole(
    project: Project,
    title: RoleTitle,
    description: RoleDescription,
  ): ReadonlyRole;

  public abstract updateRole(
    project: Project,
    roleId: RoleId,
    title?: RoleTitle,
    description?: RoleDescription,
  ): void;

  public abstract removeRole(project: Project, roleId: RoleId): void;

  public abstract assignUserToRole(
    project: Project,
    userToAssign: ReadonlyUser,
    roleId: RoleId,
  ): void;

  public abstract unassign(project: Project, roleId: RoleId): void;

  public abstract addReviewTopic(
    project: Project,
    title: ReviewTopicTitle,
    description: ReviewTopicDescription,
  ): ReadonlyReviewTopic;

  public abstract updateReviewTopic(
    project: Project,
    reviewTopicId: ReviewTopicId,
    title?: ReviewTopicTitle,
    description?: ReviewTopicDescription,
  ): void;

  public abstract removeReviewTopic(
    project: Project,
    reviewTopicId: ReviewTopicId,
  ): void;

  public abstract finishFormation(
    project: Project,
    assignees: ReadonlyUserCollection,
  ): void;

  public abstract submitPeerReviews(
    project: Project,
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
    submittedPeerReviews: [RoleId, PeerReviewScore][],
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
    cliquismComputer: CliquismComputer,
  ): void;

  public abstract submitManagerReview(project: Project): void;

  public abstract cancel(project: Project): void;

  public abstract archive(project: Project): void;
}

/**
 *
 */
export abstract class DefaultProjectState extends ProjectState {
  public update(
    _project: Project,
    _title?: ProjectTitle,
    _description?: ProjectDescription,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public addRole(
    _project: Project,
    _title: RoleTitle,
    _description: RoleDescription,
  ): ReadonlyRole {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public updateRole(
    _project: Project,
    _roleId: RoleId,
    _title?: RoleTitle,
    _description?: RoleDescription,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public removeRole(_project: Project, _roleId: RoleId): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public assignUserToRole(
    _project: Project,
    _userToAssign: ReadonlyUser,
    _roleId: RoleId,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public unassign(_project: Project, _roleId: RoleId): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public addReviewTopic(
    _project: Project,
    _title: ReviewTopicTitle,
    _description: ReviewTopicDescription,
  ): ReadonlyReviewTopic {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public updateReviewTopic(
    _project: Project,
    _reviewTopicId: ReviewTopicId,
    _title?: ReviewTopicTitle,
    _description?: ReviewTopicDescription,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public removeReviewTopic(
    _project: Project,
    _reviewTopicId: ReviewTopicId,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public finishFormation(
    _project: Project,
    _assignees: ReadonlyUserCollection,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public submitPeerReviews(
    _project: Project,
    _senderRoleId: RoleId,
    _reviewTopicId: ReviewTopicId,
    _submittedPeerReviews: [RoleId, PeerReviewScore][],
    _contributionsComputer: ContributionsComputer,
    _consensualityComputer: ConsensualityComputer,
    _cliquismComputer: CliquismComputer,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public submitManagerReview(_project: Project): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public cancel(_project: Project): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public archive(_project: Project): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }
}
