import { InvitedUserNewAssignmentModel } from 'shared/email/manager/EmailManager';

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
  public abstract renderNewAssignmentEmailPlaintext(): string;

  /**
   *
   */
  public abstract renderInvitedUserNewAssignmentEmailPlaintext(
    model: InvitedUserNewAssignmentModel,
  ): string;
}
