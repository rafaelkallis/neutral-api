import {
  ProjectModel,
  ProjectState,
  ContributionVisibility,
  SkipManagerReview,
} from 'project';
import { RoleModel, PeerReviewModel } from 'role';
import { NotificationModel, NotificationType } from 'notification';
import { PrimitiveFaker } from 'test';
import { UserModel } from 'user/domain/UserModel';

export class ModelFaker {
  private readonly primitiveFaker: PrimitiveFaker;

  public constructor(primitiveFaker: PrimitiveFaker = new PrimitiveFaker()) {
    this.primitiveFaker = primitiveFaker;
  }

  /**
   * Create fake user
   */
  public user(): UserModel {
    const id = this.primitiveFaker.id();
    const createdAt = this.primitiveFaker.timestampUnixMillis();
    const updatedAt = this.primitiveFaker.timestampUnixMillis();
    const email = this.primitiveFaker.email();
    const firstName = this.primitiveFaker.word();
    const lastName = this.primitiveFaker.word();
    const lastLoginAt = this.primitiveFaker.timestampUnixMillis();
    return new UserModel(
      id,
      createdAt,
      updatedAt,
      email,
      firstName,
      lastName,
      lastLoginAt,
    );
  }

  /**
   * Create fake project
   */
  public project(creatorId: string): ProjectModel {
    const id = this.primitiveFaker.id();
    const createdAt = this.primitiveFaker.timestampUnixMillis();
    const updatedAt = this.primitiveFaker.timestampUnixMillis();
    const title = this.primitiveFaker.words();
    const description = this.primitiveFaker.paragraph();
    const state = ProjectState.FORMATION;
    const consensuality = null;
    const contributionVisibility = ContributionVisibility.SELF;
    const skipManagerReview = SkipManagerReview.NO;
    return new ProjectModel(
      id,
      createdAt,
      updatedAt,
      title,
      description,
      creatorId,
      state,
      consensuality,
      contributionVisibility,
      skipManagerReview,
    );
  }

  /**
   * Create a fake role
   */
  public role(projectId: string, assigneeId: string | null = null): RoleModel {
    const id = this.primitiveFaker.id();
    const createdAt = this.primitiveFaker.timestampUnixMillis();
    const updatedAt = this.primitiveFaker.timestampUnixMillis();
    const title = this.primitiveFaker.words();
    const description = this.primitiveFaker.paragraph();
    const contribution = null;
    const hasSubmittedPeerReviews = false;
    return new RoleModel(
      id,
      createdAt,
      updatedAt,
      projectId,
      assigneeId,
      title,
      description,
      contribution,
      hasSubmittedPeerReviews,
    );
  }

  /**
   * Create a fake peer review
   */
  public peerReview(
    senderRoleId: string,
    receiverRoleId: string,
  ): PeerReviewModel {
    const id = this.primitiveFaker.id();
    const createdAt = this.primitiveFaker.timestampUnixMillis();
    const updatedAt = this.primitiveFaker.timestampUnixMillis();
    const score = this.primitiveFaker.number();
    return new PeerReviewModel(
      id,
      createdAt,
      updatedAt,
      senderRoleId,
      receiverRoleId,
      score,
    );
  }

  /**
   * Create a fake notification
   */
  public notification(ownerId: string): NotificationModel {
    const id = this.primitiveFaker.id();
    const createdAt = this.primitiveFaker.timestampUnixMillis();
    const updatedAt = this.primitiveFaker.timestampUnixMillis();
    const type = NotificationType.NEW_ASSIGNMENT;
    const isRead = false;
    const payload = {};
    return new NotificationModel(
      id,
      createdAt,
      updatedAt,
      ownerId,
      type,
      isRead,
      payload,
    );
  }
}
