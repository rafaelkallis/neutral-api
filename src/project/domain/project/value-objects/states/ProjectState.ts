import { OperationNotSupportedByCurrentProjectStateException } from 'project/domain/exceptions/OperationNotSupportedByCurrentProjectStateException';
import { InternalProject } from 'project/domain/project/Project';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/project/value-objects/ProjectDescription';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { ReadonlyRole } from 'project/domain/role/Role';
import { ReadonlyUser } from 'user/domain/User';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { ReadonlyUserCollection } from 'user/domain/UserCollection';
import { ReviewTopicInput } from 'project/domain/review-topic/ReviewTopicInput';
import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';

/**
 *
 */
export abstract class ProjectState extends ValueObject {
  public abstract update(
    project: InternalProject,
    title?: ProjectTitle,
    description?: ProjectDescription,
  ): void;

  public abstract addRole(
    project: InternalProject,
    title: RoleTitle,
    description: RoleDescription,
  ): ReadonlyRole;

  public abstract updateRole(
    project: InternalProject,
    roleId: RoleId,
    title?: RoleTitle,
    description?: RoleDescription,
  ): void;

  public abstract removeRole(project: InternalProject, roleId: RoleId): void;

  public abstract assignUserToRole(
    project: InternalProject,
    userToAssign: ReadonlyUser,
    roleId: RoleId,
  ): void;

  public abstract unassign(project: InternalProject, roleId: RoleId): void;

  public abstract addReviewTopic(
    project: InternalProject,
    title: ReviewTopicTitle,
    description: ReviewTopicDescription,
    input: ReviewTopicInput,
  ): ReadonlyReviewTopic;

  public abstract updateReviewTopic(
    project: InternalProject,
    reviewTopicId: ReviewTopicId,
    title?: ReviewTopicTitle,
    description?: ReviewTopicDescription,
    input?: ReviewTopicInput,
  ): void;

  public abstract removeReviewTopic(
    project: InternalProject,
    reviewTopicId: ReviewTopicId,
  ): void;

  public abstract finishFormation(
    project: InternalProject,
    assignees: ReadonlyUserCollection,
  ): void;

  public abstract submitPeerReviews(
    project: InternalProject,
    peerReviews: ReadonlyPeerReviewCollection,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void;

  public abstract completePeerReviews(
    project: InternalProject,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void;

  public abstract submitManagerReview(project: InternalProject): void;

  public abstract cancel(project: InternalProject): void;

  public abstract archive(project: InternalProject): void;
}

/**
 *
 */
export abstract class DefaultProjectState extends ProjectState {
  public update(
    project: InternalProject,
    title?: ProjectTitle,
    description?: ProjectDescription,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public addRole(
    project: InternalProject,
    title: RoleTitle,
    description: RoleDescription,
  ): ReadonlyRole {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public updateRole(
    project: InternalProject,
    roleId: RoleId,
    title?: RoleTitle,
    description?: RoleDescription,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public removeRole(project: InternalProject, roleId: RoleId): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public assignUserToRole(
    project: InternalProject,
    userToAssign: ReadonlyUser,
    roleId: RoleId,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public unassign(project: InternalProject, roleId: RoleId): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public addReviewTopic(
    _project: InternalProject,
    _title: ReviewTopicTitle,
    _description: ReviewTopicDescription,
    _input: ReviewTopicInput,
  ): ReadonlyReviewTopic {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public updateReviewTopic(
    _project: InternalProject,
    _reviewTopicId: ReviewTopicId,
    _title?: ReviewTopicTitle,
    _description?: ReviewTopicDescription,
    _input?: ReviewTopicInput,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public removeReviewTopic(
    project: InternalProject,
    reviewTopicId: ReviewTopicId,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public finishFormation(
    project: InternalProject,
    assignees: ReadonlyUserCollection,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public submitPeerReviews(
    _project: InternalProject,
    _peerReviews: ReadonlyPeerReviewCollection,
    _contributionsComputer: ContributionsComputer,
    _consensualityComputer: ConsensualityComputer,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public completePeerReviews(
    _project: InternalProject,
    _contributionsComputer: ContributionsComputer,
    _consensualityComputer: ConsensualityComputer,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public submitManagerReview(project: InternalProject): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public cancel(project: InternalProject): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public archive(project: InternalProject): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }
}
