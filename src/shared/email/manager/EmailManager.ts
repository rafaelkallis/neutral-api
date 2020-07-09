/**
 * Email Manager.
 */
export abstract class EmailManager {
  /**
   * Sends an email with the login template.
   */
  public abstract async sendLoginEmail(
    to: string,
    loginMagicLink: string,
  ): Promise<void>;

  /**
   * Sends an email with the signup template.
   */
  public abstract async sendSignupEmail(
    to: string,
    signupMagicLink: string,
  ): Promise<void>;

  /**
   * Sends an email with the email-change template.
   */
  public abstract async sendEmailChangeEmail(
    to: string,
    emailChangeMagicLink: string,
  ): Promise<void>;

  /**
   * Sends an email to a user that was assigned to a role.
   */
  public abstract async sendNewAssignmentEmail(
    to: string,
    model: RoleCtaModel,
  ): Promise<void>;

  /**
   * Sends an email to a pending user that was assigned to a role.
   */
  public abstract async sendPendingUserNewAssignmentEmail(
    to: string,
    model: RoleCtaModel,
  ): Promise<void>;

  public abstract async sendPeerReviewRequestedEmail(
    to: string,
    model: ProjectCtaModel,
  ): Promise<void>;

  public abstract async sendManagerReviewRequestedEmail(
    to: string,
    model: ProjectCtaModel,
  ): Promise<void>;

  public abstract async sendProjectFinishedEmail(
    to: string,
    model: ProjectCtaModel,
  ): Promise<void>;
}

export interface CtaModel {
  readonly firstName?: string;
  readonly ctaActionUrl: string;
}

export interface ProjectCtaModel extends CtaModel {
  readonly projectTitle: string;
}

export interface RoleCtaModel extends ProjectCtaModel {
  readonly roleTitle: string;
}
