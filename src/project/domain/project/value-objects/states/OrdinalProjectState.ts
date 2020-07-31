import { ProjectState } from './ProjectState';
import { InternalProject } from '../../Project';
import { ProjectTitle } from '../ProjectTitle';
import { ProjectDescription } from '../ProjectDescription';
import { OperationNotSupportedByCurrentProjectStateException } from 'project/domain/exceptions/OperationNotSupportedByCurrentProjectStateException';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { ReadonlyRole } from 'project/domain/role/Role';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ReadonlyUser } from 'user/domain/User';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { ReviewTopicInput } from 'project/domain/review-topic/ReviewTopicInput';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { ReadonlyUserCollection } from 'user/domain/UserCollection';
import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { PeerReviewVisibility } from '../PeerReviewVisibility';

export abstract class OrdinalProjectState extends ProjectState {
  public abstract getOrdinal(): number;

  public isGreaterEqualsThan(otherState: OrdinalProjectState): boolean {
    return this.getOrdinal() >= otherState.getOrdinal();
  }

  public isSmallerEqualsThan(other: OrdinalProjectState): boolean {
    return this.getOrdinal() <= other.getOrdinal();
  }
}

export abstract class DefaultOrdinalProjectState extends OrdinalProjectState {
  public update(
    _project: InternalProject,
    _title?: ProjectTitle,
    _description?: ProjectDescription,
    _peerReviewVisibility?: PeerReviewVisibility,
    _meta?: Record<string, unknown>,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public addRole(
    _project: InternalProject,
    _title: RoleTitle,
    _description: RoleDescription,
  ): ReadonlyRole {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public updateRole(
    _project: InternalProject,
    _roleId: RoleId,
    _title?: RoleTitle,
    _description?: RoleDescription,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public removeRole(_project: InternalProject, _roleId: RoleId): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public assignUserToRole(
    _project: InternalProject,
    _userToAssign: ReadonlyUser,
    _roleId: RoleId,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public unassign(_project: InternalProject, _roleId: RoleId): void {
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
    _project: InternalProject,
    _reviewTopicId: ReviewTopicId,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public finishFormation(
    _project: InternalProject,
    _assignees: ReadonlyUserCollection,
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

  public submitManagerReview(_project: InternalProject): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public cancel(_project: InternalProject): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public archive(_project: InternalProject): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }
}
