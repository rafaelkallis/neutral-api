import {
  InternalProject,
  UpdateProjectContext,
} from 'project/domain/project/Project';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { ReadonlyRole } from 'project/domain/role/Role';
import { ReadonlyUser } from 'user/domain/User';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { ReviewTopicInput } from 'project/domain/review-topic/ReviewTopicInput';
import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { MilestoneTitle } from 'project/domain/milestone/value-objects/MilestoneTitle';
import { MilestoneDescription } from 'project/domain/milestone/value-objects/MilestoneDescription';
import { ReadonlyMilestone } from 'project/domain/milestone/Milestone';
import { Comprarable } from 'shared/domain/value-objects/Comparable';
import { DomainException } from 'shared/domain/exceptions/DomainException';
import { ProjectAnalyzer } from 'project/domain/ProjectAnalyzer';

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
    this.throwOperationNotSupported();
  }

  public addRole(
    _project: InternalProject,
    _title: RoleTitle,
    _description: RoleDescription,
  ): ReadonlyRole {
    this.throwOperationNotSupported();
  }

  public updateRole(
    _project: InternalProject,
    _roleId: RoleId,
    _title?: RoleTitle,
    _description?: RoleDescription,
  ): void {
    this.throwOperationNotSupported();
  }

  public removeRole(_project: InternalProject, _roleId: RoleId): void {
    this.throwOperationNotSupported();
  }

  public assignUserToRole(
    _project: InternalProject,
    _userToAssign: ReadonlyUser,
    _roleId: RoleId,
  ): void {
    this.throwOperationNotSupported();
  }

  public unassign(_project: InternalProject, _roleId: RoleId): void {
    this.throwOperationNotSupported();
  }

  public addReviewTopic(
    _project: InternalProject,
    _title: ReviewTopicTitle,
    _description: ReviewTopicDescription,
    _input: ReviewTopicInput,
  ): ReadonlyReviewTopic {
    this.throwOperationNotSupported();
  }

  public updateReviewTopic(
    _project: InternalProject,
    _reviewTopicId: ReviewTopicId,
    _title?: ReviewTopicTitle,
    _description?: ReviewTopicDescription,
    _input?: ReviewTopicInput,
  ): void {
    this.throwOperationNotSupported();
  }

  public removeReviewTopic(
    _project: InternalProject,
    _reviewTopicId: ReviewTopicId,
  ): void {
    this.throwOperationNotSupported();
  }

  public addMilestone(
    _project: InternalProject,
    _title: MilestoneTitle,
    _description: MilestoneDescription,
  ): ReadonlyMilestone {
    this.throwOperationNotSupported();
  }

  public finishFormation(_project: InternalProject): void {
    this.throwOperationNotSupported();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async submitPeerReviews(
    _project: InternalProject,
    _peerReviews: ReadonlyPeerReviewCollection,
    _projectAnalyzer: ProjectAnalyzer,
  ): Promise<void> {
    this.throwOperationNotSupported();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async completePeerReviews(
    _project: InternalProject,
    _projectAnalyzer: ProjectAnalyzer,
  ): Promise<void> {
    this.throwOperationNotSupported();
  }

  public submitManagerReview(_project: InternalProject): void {
    this.throwOperationNotSupported();
  }

  public cancel(_project: InternalProject): void {
    this.throwOperationNotSupported();
  }

  public archive(_project: InternalProject): void {
    this.throwOperationNotSupported();
  }

  protected abstract getOrdinal(): number;

  public compareTo(other: ProjectState): number {
    return this.getOrdinal() - other.getOrdinal();
  }

  protected throwOperationNotSupported(): never {
    throw new DomainException(
      'operation_not_supported_by_current_project_state',
      'Operation not supported by the current project state.',
    );
  }
}
