import { Inject } from '@nestjs/common';

export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');

export function InjectEmailService(): ParameterDecorator {
  return Inject(EMAIL_SERVICE);
}

/**
 * Email Service.
 */
export interface EmailService {
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
