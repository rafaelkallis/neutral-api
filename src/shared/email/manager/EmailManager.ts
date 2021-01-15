/**
 * Email Manager.
 */
export abstract class EmailManager {
  /**
   * Sends an email with the login template.
   */
  public abstract sendLoginEmail(
    to: string,
    model: CtaModelWithFirstName,
  ): Promise<void>;

  /**
   * Sends an email with the signup template.
   */
  public abstract sendSignupEmail(to: string, model: CtaModel): Promise<void>;

  /**
   * Sends an email with the email-change template.
   */
  public abstract sendEmailChangeEmail(
    to: string,
    model: CtaModelWithFirstName,
  ): Promise<void>;

  /**
   * Sends an email to a user that was assigned to a role.
   */
  public abstract sendNewAssignmentEmail(
    to: string,
    model: RoleCtaModel,
  ): Promise<void>;

  public abstract sendPeerReviewRequestedEmail(
    to: string,
    model: ProjectCtaModel,
  ): Promise<void>;

  public abstract sendManagerReviewRequestedEmail(
    to: string,
    model: ProjectCtaModel,
  ): Promise<void>;

  public abstract sendProjectFinishedEmail(
    to: string,
    model: ProjectCtaModel,
  ): Promise<void>;
}

export interface CtaModel {
  readonly ctaUrl: string;
}

export interface CtaModelWithFirstName extends CtaModel {
  readonly firstName: string;
}

export interface ProjectCtaModel extends CtaModelWithFirstName {
  readonly projectTitle: string;
}

export interface RoleCtaModel extends ProjectCtaModel {
  readonly roleTitle: string;
}
