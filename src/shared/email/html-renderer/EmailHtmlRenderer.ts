import {
  RoleCtaModel,
  ProjectCtaModel,
  CtaModelWithFirstName,
  CtaModel,
} from 'shared/email/manager/EmailManager';

/**
 *
 */
export abstract class EmailHtmlRenderer {
  /**
   *
   */
  public abstract renderLoginEmailHtml(model: CtaModelWithFirstName): string;

  /**
   *
   */
  public abstract renderSignupEmailHtml(model: CtaModel): string;

  /**
   *
   */
  public abstract renderEmailChangeEmailHtml(
    model: CtaModelWithFirstName,
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
