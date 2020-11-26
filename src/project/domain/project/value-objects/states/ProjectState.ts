import { OperationNotSupportedByCurrentProjectStateException } from 'project/domain/exceptions/OperationNotSupportedByCurrentProjectStateException';
import {
  InternalProject,
  UpdateProjectContext,
} from 'project/domain/project/Project';
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
import { MilestoneTitle } from 'project/domain/milestone/value-objects/MilestoneTitle';
import { MilestoneDescription } from 'project/domain/milestone/value-objects/MilestoneDescription';
import { ReadonlyMilestone } from 'project/domain/milestone/Milestone';
import { Comprarable } from 'shared/domain/value-objects/Comparable';

/**
 *
 */
export abstract class ProjectState
  extends ValueObject
  implements Comprarable<ProjectState> {
  public update(
    _project: InternalProject,
    _context: UpdateProjectContext,
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

  public addMilestone(
    _project: InternalProject,
    _title: MilestoneTitle,
    _description: MilestoneDescription,
  ): ReadonlyMilestone {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public finishFormation(
    _project: InternalProject,
    _assignees: ReadonlyUserCollection,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async submitPeerReviews(
    _project: InternalProject,
    _peerReviews: ReadonlyPeerReviewCollection,
    _contributionsComputer: ContributionsComputer,
    _consensualityComputer: ConsensualityComputer,
  ): Promise<void> {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async completePeerReviews(
    _project: InternalProject,
    _contributionsComputer: ContributionsComputer,
    _consensualityComputer: ConsensualityComputer,
  ): Promise<void> {
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

  protected abstract getOrdinal(): number;

  public compareTo(other: ProjectState): number {
    return this.getOrdinal() - other.getOrdinal();
  }
}
