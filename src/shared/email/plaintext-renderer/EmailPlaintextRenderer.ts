import {
  PendingUserNewAssignmentModel,
  NewAssignmentModel,
  ProjectCtaModel,
} from 'shared/email/manager/EmailManager';

/**
 *
 */
export abstract class EmailPlaintextRenderer {
  /**
   *
   */
  public abstract renderLoginEmailPlaintext(loginMagicLink: string): string;

  /**
   *
   */
  public abstract renderSignupEmailPlaintext(signupMagicLink: string): string;

  /**
   *
   */
  public abstract renderEmailChangeEmailPlaintext(
    emailChangeMagicLink: string,
  ): string;

  /**
   *
   */
  public abstract renderNewAssignmentEmailPlaintext(
    model: NewAssignmentModel,
  ): string;

  /**
   *
   */
  public abstract renderInvitedUserNewAssignmentEmailPlaintext(
    model: PendingUserNewAssignmentModel,
  ): string;

  public abstract renderPeerReviewRequestedEmailPlaintext(
    model: ProjectCtaModel,
  ): string;

  public abstract renderManagerReviewRequestedEmailPlaintext(
    model: ProjectCtaModel,
  ): string;

  public abstract renderProjectFinishedEmailPlaintext(
    model: ProjectCtaModel,
  ): string;
}
