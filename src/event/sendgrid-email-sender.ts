import { Injectable, Inject, NotImplementedException } from '@nestjs/common';
import { Config, CONFIG } from 'config';
import { EmailSender } from 'email/email-sender';
import sendgrid from '@sendgrid/mail';

/**
 * Sendgrid Email Sender
 */
@Injectable()
export class SendgridEmailSender implements EmailSender {
  public constructor(@Inject(CONFIG) config: Config) {
    sendgrid.setApiKey(config.get('SENDGRID_API_KEY'));
  }

  /**
   * Sends an email with the login template.
   */
  public async sendLoginEmail(
    to: string,
    loginMagicLink: string,
  ): Promise<void> {
    await sendgrid.send({
      from: { email: 'no-reply@covee.network' },
      to: { email: to },
      templateId: 'd-3781fe6ff75544bea7a191c029587816',
      dynamicTemplateData: { loginMagicLink },
    });
  }

  /**
   * Sends an email with the signup template.
   */
  public async sendSignupEmail(
    to: string,
    signupMagicLink: string,
  ): Promise<void> {
    await sendgrid.send({
      from: { email: 'no-reply@covee.network' },
      to: { email: to },
      templateId: 'd-a578d5b2804847e795e93aea4d40a603',
      dynamicTemplateData: { signupMagicLink },
    });
  }

  /**
   * Sends an email with the email-change template.
   */
  public async sendEmailChangeEmail(
    to: string,
    emailChangeMagicLink: string,
  ): Promise<void> {
    await sendgrid.send({
      from: { email: 'no-reply@covee.network' },
      to: { email: to },
      templateId: 'd-a578d5b2804847e795e93aea4d40a603',
      dynamicTemplateData: { emailChangeMagicLink },
    });
  }

  /**
   * Sends an email to a user that was assigned to a role.
   */
  public async sendNewAssignmentEmail(to: string): Promise<void> {
    throw new NotImplementedException();
  }

  /**
   * Sends an email to a user that is not registered but was assigned to a new role.
   */
  public async sendUnregisteredUserNewAssignmentEmail(
    to: string,
  ): Promise<void> {
    throw new NotImplementedException();
  }
}
