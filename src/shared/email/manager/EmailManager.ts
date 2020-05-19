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
  public abstract async sendNewAssignmentEmail(to: string): Promise<void>;

  /**
   * Sends an email to a user that is not registered but was assigned to a new role.
   */
  public abstract async sendInvitedUserNewAssignmentEmail(
    to: string,
    projectId: string,
    projectTitle: string,
    roleTitle: string,
    signupMagicLink: string,
  ): Promise<void>;
}
