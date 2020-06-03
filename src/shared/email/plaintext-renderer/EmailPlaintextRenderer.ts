import {
  InvitedUserNewAssignmentModel,
  NewAssignmentModel,
  PeerReviewRequestedModel,
  ProjectFinishedModel,
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
    model: InvitedUserNewAssignmentModel,
  ): string;

  public abstract renderPeerReviewRequestedEmailPlaintext(
    model: PeerReviewRequestedModel,
  ): string;

  public abstract renderProjectFinishedEmailPlaintext(
    model: ProjectFinishedModel,
  ): string;
}
