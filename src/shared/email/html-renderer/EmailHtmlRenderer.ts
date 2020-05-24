import {
  InvitedUserNewAssignmentModel,
  NewAssignmentModel,
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
    model: InvitedUserNewAssignmentModel,
  ): string;
}
