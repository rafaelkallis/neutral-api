import {
  RoleCtaModel,
  ProjectCtaModel,
  CtaModelWithFirstName,
  CtaModel,
} from 'shared/email/manager/EmailManager';

/**
 *
 */
export abstract class EmailPlaintextRenderer {
  /**
   *
   */
  public abstract renderLoginEmailPlaintext(
    model: CtaModelWithFirstName,
  ): string;

  /**
   *
   */
  public abstract renderSignupEmailPlaintext(model: CtaModel): string;

  /**
   *
   */
  public abstract renderEmailChangeEmailPlaintext(
    model: CtaModelWithFirstName,
  ): string;

  /**
   *
   */
  public abstract renderNewAssignmentEmailPlaintext(
    model: RoleCtaModel,
  ): string;

  /**
   *
   */
  public abstract renderInvitedUserNewAssignmentEmailPlaintext(
    model: RoleCtaModel,
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
