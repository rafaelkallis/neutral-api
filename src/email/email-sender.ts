export const EMAIL_SENDER = Symbol('EMAIL_SENDER');

/**
 * Email Sender
 */
export interface EmailSender {
  /**
   * Sends an email with the login template.
   */
  sendLoginEmail(to: string, loginMagicLink: string): Promise<void>;

  /**
   * Sends an email with the signup template.
   */
  sendSignupEmail(to: string, signupMagicLink: string): Promise<void>;

  /**
   * Sends an email with the email-change template.
   */
  sendEmailChangeEmail(to: string, emailChangeMagicLink: string): Promise<void>;

  /**
   * Sends an email to a user that was assigned to a role.
   */
  sendNewAssignmentEmail(to: string): Promise<void>;

  /**
   * Sends an email to a user that is not registered but was assigned to a new role.
   */
  sendUnregisteredUserNewAssignmentEmail(to: string): Promise<void>;
}
