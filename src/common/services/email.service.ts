import { Injectable } from '@nestjs/common';
import sendgrid from '@sendgrid/mail';

import { ConfigService } from './config.service';

/**
 * Email Service
 */
@Injectable()
export class EmailService {
  constructor(configService: ConfigService) {
    sendgrid.setApiKey(configService.get('SENDGRID_API_KEY'));
  }

  /**
   * Sends an email with the login template.
   */
  async sendLoginEmail(to: string, loginMagicLink: string) {
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
  async sendSignupEmail(to: string, signupMagicLink: string) {
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
  async sendEmailChangeEmail(to: string, emailChangeMagicLink: string) {
    await sendgrid.send({
      from: { email: 'no-reply@covee.network' },
      to: { email: to },
      templateId: 'd-a578d5b2804847e795e93aea4d40a603',
      dynamicTemplateData: { emailChangeMagicLink },
    });
  }
}
