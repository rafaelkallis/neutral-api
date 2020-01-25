import { Injectable, NotImplementedException } from '@nestjs/common';
import { EmailTemplateEngineService } from 'email/email-template-engine.service';

/**
 * Handlebars Email Template Engine
 */
@Injectable()
export class HandlebarsEmailTemplateEngineService
  implements EmailTemplateEngineService {
  /**
   *
   */
  public renderLoginEmail(loginMagicLink: string): Promise<string> {
    throw new NotImplementedException();
  }

  /**
   *
   */
  public renderSignupEmail(signupMagicLink: string): Promise<string> {
    throw new NotImplementedException();
  }

  /**
   *
   */
  public renderEmailChangeEmail(emailChangeMagicLink: string): Promise<string> {
    throw new NotImplementedException();
  }

  /**
   *
   */
  public renderNewAssignmentEmail(): Promise<string> {
    throw new NotImplementedException();
  }

  /**
   *
   */
  public renderUnregisteredUserNewAssignmentEmail(): Promise<string> {
    throw new NotImplementedException();
  }
}
