import { Injectable, NotImplementedException } from '@nestjs/common';
import { Config } from 'shared/config/application/Config';
import {
  EmailManager,
  ProjectCtaModel,
  CtaModelWithFirstName,
  CtaModel,
} from 'shared/email/manager/EmailManager';
import axios from 'axios';

/**
 * Sendgrid Email Manager
 */
@Injectable()
export class SendgridEmailManager extends EmailManager {
  private readonly sendgridApiKey: string;
  private readonly sendgridUrl: string;

  public constructor(_config: Config) {
    super();
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
    model: CtaModelWithFirstName,
  ): Promise<void> {
    const templateId = 'd-3781fe6ff75544bea7a191c029587816';
    const dynamicTemplateData = { loginMagicLink: model.ctaUrl };
    await this.sendEmail(to, templateId, dynamicTemplateData);
  }

  /**
   * Sends an email with the signup template.
   */
  public async sendSignupEmail(to: string, model: CtaModel): Promise<void> {
    const templateId = 'd-a578d5b2804847e795e93aea4d40a603';
    const dynamicTemplateData = { signupMagicLink: model.ctaUrl };
    await this.sendEmail(to, templateId, dynamicTemplateData);
  }

  /**
   * Sends an email with the email-change template.
   */
  public async sendEmailChangeEmail(
    to: string,
    model: CtaModelWithFirstName,
  ): Promise<void> {
    const templateId = 'd-a578d5b2804847e795e93aea4d40a603';
    const dynamicTemplateData = { emailChangeMagicLink: model.ctaUrl };
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
  public async sendPendingUserNewAssignmentEmail(to: string): Promise<void> {
    const templateId = '';
    const dynamicTemplateData = {};
    await this.sendEmail(to, templateId, dynamicTemplateData);
  }

  public async sendPeerReviewRequestedEmail(
    _to: string,
    _model: ProjectCtaModel,
  ): Promise<void> {
    return Promise.reject(new Error('Method not implemented.'));
  }

  public async sendManagerReviewRequestedEmail(
    _to: string,
    _model: ProjectCtaModel,
  ): Promise<void> {
    return Promise.reject(new Error('not implemented'));
  }

  public async sendProjectFinishedEmail(
    _to: string,
    _model: ProjectCtaModel,
  ): Promise<void> {
    return Promise.reject(new Error('not implemented'));
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
