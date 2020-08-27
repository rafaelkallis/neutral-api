import { OrdinalProjectState } from 'project/domain/project/value-objects/states/OrdinalProjectState';
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
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { ReadonlyUserCollection } from 'user/domain/UserCollection';
import { ReviewTopicInput } from 'project/domain/review-topic/ReviewTopicInput';
import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ReviewSubjectType } from 'project/domain/review-topic/value-objects/ReviewSubjectType';

export abstract class OrdinalProjectStateDecorator extends OrdinalProjectState {
  protected readonly base: OrdinalProjectState;

  public constructor(base: OrdinalProjectState) {
    super();
    this.base = base;
  }

  public getOrdinal(): number {
    return this.base.getOrdinal();
  }

  public update(project: InternalProject, context: UpdateProjectContext): void {
    this.base.update(project, context);
  }

  public addRole(
    project: InternalProject,
    title: RoleTitle,
    description: RoleDescription,
  ): ReadonlyRole {
    return this.base.addRole(project, title, description);
  }

  public updateRole(
    project: InternalProject,
    roleId: RoleId,
    title?: RoleTitle,
    description?: RoleDescription,
  ): void {
    this.base.updateRole(project, roleId, title, description);
  }

  public removeRole(project: InternalProject, roleId: RoleId): void {
    this.base.removeRole(project, roleId);
  }

  public assignUserToRole(
    project: InternalProject,
    userToAssign: ReadonlyUser,
    roleId: RoleId,
  ): void {
    this.base.assignUserToRole(project, userToAssign, roleId);
  }

  public unassign(project: InternalProject, roleId: RoleId): void {
    this.base.unassign(project, roleId);
  }

  public addReviewTopic(
    project: InternalProject,
    title: ReviewTopicTitle,
    description: ReviewTopicDescription,
    input: ReviewTopicInput,
    subjectType: ReviewSubjectType,
  ): ReadonlyReviewTopic {
    return this.base.addReviewTopic(
      project,
      title,
      description,
      input,
      subjectType,
    );
  }

  public updateReviewTopic(
    project: InternalProject,
    reviewTopicId: ReviewTopicId,
    title?: ReviewTopicTitle,
    description?: ReviewTopicDescription,
    input?: ReviewTopicInput,
  ): void {
    this.base.updateReviewTopic(
      project,
      reviewTopicId,
      title,
      description,
      input,
    );
  }

  public removeReviewTopic(
    project: InternalProject,
    reviewTopicId: ReviewTopicId,
  ): void {
    this.base.removeReviewTopic(project, reviewTopicId);
  }

  public finishFormation(
    project: InternalProject,
    assignees: ReadonlyUserCollection,
  ): void {
    this.base.finishFormation(project, assignees);
  }

  public cancel(project: InternalProject): void {
    this.base.cancel(project);
  }

  public submitPeerReviews(
    project: InternalProject,
    peerReviews: ReadonlyPeerReviewCollection,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void {
    this.base.submitPeerReviews(
      project,
      peerReviews,
      contributionsComputer,
      consensualityComputer,
    );
  }

  public completePeerReviews(
    project: InternalProject,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void {
    this.base.completePeerReviews(
      project,
      contributionsComputer,
      consensualityComputer,
    );
  }

  public submitManagerReview(project: InternalProject): void {
    this.base.submitManagerReview(project);
  }

  public archive(project: InternalProject): void {
    this.base.archive(project);
  }
}
