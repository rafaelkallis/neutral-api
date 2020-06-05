import {
  PendingUserNewAssignmentModel,
  NewAssignmentModel,
  PeerReviewRequestedModel,
  ProjectFinishedModel,
  ManagerReviewRequestedModel,
} from 'shared/email/manager/EmailManager';

/**
 *
 */
export abstract class EmailHtmlRenderer {
  /**
   *
   */
  public abstract renderLoginEmailHtml(loginMagicLink: string): string;

  /**
   *
   */
  public abstract renderSignupEmailHtml(signupMagicLink: string): string;

  /**
   *
   */
  public abstract renderEmailChangeEmailHtml(
    emailChangeMagicLink: string,
  ): string;

  /**
   *
   */
  public abstract renderNewAssignmentEmailHtml(
    model: NewAssignmentModel,
  ): string;

  /**
   *
   */
  public abstract renderInvitedUserNewAssignmentEmailHtml(
    model: PendingUserNewAssignmentModel,
  ): string;

  public abstract renderPeerReviewRequestedEmailHtml(
    model: PeerReviewRequestedModel,
  ): string;

  public abstract renderManagerReviewRequestedEmailHtml(
    model: ManagerReviewRequestedModel,
  ): string;

  public abstract renderProjectFinishedEmailHtml(
    model: ProjectFinishedModel,
  ): string;
}
