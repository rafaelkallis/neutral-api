import { Injectable, NotImplementedException } from '@nestjs/common';
import { EmailTemplateEngineService } from 'email/email-template-engine.service';
import { Environment, FileSystemLoader } from 'nunjucks';
import path from 'path';

/**
 * Nunjucks Email Template Engine
 */
@Injectable()
export class NunjucksEmailTemplateEngineService
  implements EmailTemplateEngineService {
  private readonly environment: Environment;

  public constructor() {
    const templatesPath = path.resolve(__dirname, 'templates');
    const fileSystemLoader = new FileSystemLoader(templatesPath);
    this.environment = new Environment(fileSystemLoader);
  }

  /**
   *
   */
  public async renderLoginHtml(loginMagicLink: string): Promise<string> {
    return this.environment.render('login.njk', { loginMagicLink });
  }

  /**
   *
   */
  public renderSignupHtml(signupMagicLink: string): Promise<string> {
    throw new NotImplementedException();
  }

  /**
   *
   */
  public renderEmailChangeHtml(emailChangeMagicLink: string): Promise<string> {
    throw new NotImplementedException();
  }

  /**
   *
   */
  public renderNewAssignmentHtml(): Promise<string> {
    throw new NotImplementedException();
  }

  /**
   *
   */
  public renderUnregisteredUserNewAssignmentHtml(): Promise<string> {
    throw new NotImplementedException();
  }
}
