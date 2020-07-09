import {
  RoleCtaModel,
  ProjectCtaModel,
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
  public abstract renderNewAssignmentEmailHtml(model: RoleCtaModel): string;

  public abstract renderPeerReviewRequestedEmailHtml(
    model: ProjectCtaModel,
  ): string;

  public abstract renderManagerReviewRequestedEmailHtml(
    model: ProjectCtaModel,
  ): string;

  public abstract renderProjectFinishedEmailHtml(
    model: ProjectCtaModel,
  ): string;
}
