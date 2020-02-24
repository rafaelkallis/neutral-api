import { Injectable } from '@nestjs/common';
import { EmailManager } from 'email/EmailManager';

/**
 * Mock Email Service
 */
@Injectable()
export class MockEmailService implements EmailManager {
  /**
   * Sends an email with the login template.
   */
  public async sendLoginEmail(
    to: string,
    loginMagicLink: string,
  ): Promise<void> {}

  /**
   * Sends an email with the signup template.
   */
  public async sendSignupEmail(
    to: string,
    signupMagicLink: string,
  ): Promise<void> {}

  /**
   * Sends an email with the email-change template.
   */
  public async sendEmailChangeEmail(
    to: string,
    emailChangeMagicLink: string,
  ): Promise<void> {}

  /**
   * Sends an email to a user that was assigned to a role.
   */
  public async sendNewAssignmentEmail(to: string): Promise<void> {}

  /**
   * Sends an email to a user that is not registered but was assigned to a new role.
   */
  public async sendUnregisteredUserNewAssignmentEmail(
    to: string,
  ): Promise<void> {}
}
