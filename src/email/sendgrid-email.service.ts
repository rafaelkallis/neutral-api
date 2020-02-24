import { Injectable, NotImplementedException } from '@nestjs/common';
import { Config, InjectConfig } from 'config/application/Config';
import { EmailManager } from 'email/EmailManager';
import axios from 'axios';

/**
 * Sendgrid Email Service
 */
@Injectable()
export class SendgridEmailService implements EmailManager {
  private readonly sendgridApiKey: string;
  private readonly sendgridUrl: string;

  public constructor(@InjectConfig() _config: Config) {
    // this.sendgridApiKey = config.get('SENDGRID_API_KEY');
    // this.sendgridUrl = config.get('SENDGRID_URL');
    this.sendgridApiKey = '';
    this.sendgridUrl = '';
    throw new NotImplementedException();
  }

  /**
   * Sends an email with the login template.
   */
  public async sendLoginEmail(
    to: string,
    loginMagicLink: string,
  ): Promise<void> {
    const templateId = 'd-3781fe6ff75544bea7a191c029587816';
    const dynamicTemplateData = { loginMagicLink };
    await this.sendEmail(to, templateId, dynamicTemplateData);
  }

  /**
   * Sends an email with the signup template.
   */
  public async sendSignupEmail(
    to: string,
    signupMagicLink: string,
  ): Promise<void> {
    const templateId = 'd-a578d5b2804847e795e93aea4d40a603';
    const dynamicTemplateData = { signupMagicLink };
    // await sendgrid.send({
    //   from: { email: 'no-reply@covee.network' },
    //   to: { email: to },
    //   templateId,
    //   dynamicTemplateData,
    // });
    await this.sendEmail(to, templateId, dynamicTemplateData);
  }

  /**
   * Sends an email with the email-change template.
   */
  public async sendEmailChangeEmail(
    to: string,
    emailChangeMagicLink: string,
  ): Promise<void> {
    const templateId = 'd-a578d5b2804847e795e93aea4d40a603';
    const dynamicTemplateData = { emailChangeMagicLink };
    // await sendgrid.send({
    //   from: { email: 'no-reply@covee.network' },
    //   to: { email: to },
    //   templateId,
    //   dynamicTemplateData,
    // });
    await this.sendEmail(to, templateId, dynamicTemplateData);
  }

  /**
   * Sends an email to a user that was assigned to a role.
   */
  public async sendNewAssignmentEmail(to: string): Promise<void> {
    const templateId = '';
    const dynamicTemplateData = {};
    await this.sendEmail(to, templateId, dynamicTemplateData);
  }

  /**
   * Sends an email to a user that is not registered but was assigned to a new role.
   */
  public async sendUnregisteredUserNewAssignmentEmail(
    to: string,
  ): Promise<void> {
    const templateId = '';
    const dynamicTemplateData = {};
    await this.sendEmail(to, templateId, dynamicTemplateData);
  }

  /**
   *
   */
  private async sendEmail(
    to: string,
    templateId: string,
    dynamicTemplateData: Record<string, string>,
  ): Promise<void> {
    const url = this.sendgridUrl + '/v3/mail/send';
    const body = {
      personalizations: [
        {
          to: { email: to },
          dynamic_template_data: dynamicTemplateData,
        },
      ],
      from: { email: 'no-reply@covee.network' },
      template_id: templateId,
    };
    const config = {
      headers: {
        Authorization: `Bearer ${this.sendgridApiKey}`,
      },
    };
    await axios.post(url, body, config);
  }
}
