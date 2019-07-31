import { Injectable } from '@nestjs/common';
import * as sendgrid from '@sendgrid/mail';
import { ConfigService } from '../config/config.service';

@Injectable()
export class EmailService {
  constructor(configService: ConfigService) {
    sendgrid.setApiKey(configService.get('SENDGRID_API_KEY'));
  }

  async sendLoginEmail(to: string, magicLoginLink: string) {
    await sendgrid.send({
      from: { email: 'no-reply@covee.network' },
      to: { email: to },
      templateId: 'd-3781fe6ff75544bea7a191c029587816',
      dynamicTemplateData: { magicLoginLink },
    });
  }

  async sendSignupEmail(to: string, magicSignupLink: string) {
    await sendgrid.send({
      from: { email: 'no-reply@covee.network' },
      to: { email: to },
      templateId: 'd-a578d5b2804847e795e93aea4d40a603',
      dynamicTemplateData: { magicSignupLink },
    });
  }
}
