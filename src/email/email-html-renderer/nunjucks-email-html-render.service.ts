import { Injectable, NotImplementedException } from '@nestjs/common';
import { Environment, FileSystemLoader } from 'nunjucks';
import path from 'path';
import { EmailHtmlRendererService } from 'email/email-html-renderer/email-html-renderer.service';

/**
 * Nunjucks Email Html Renderer
 */
@Injectable()
export class NunjucksEmailHtmlRendererService
  implements EmailHtmlRendererService {
  private readonly environment: Environment;

  public constructor() {
    const templatesPath = path.resolve(__dirname, 'nunjucks-templates');
    const fileSystemLoader = new FileSystemLoader(templatesPath);
    this.environment = new Environment(fileSystemLoader);
  }

  public renderLoginEmailHtml(loginMagicLink: string): string {
    return this.environment.render('login.njk', { loginMagicLink });
  }

  /**
   *
   */
  public renderSignupEmailHtml(signupMagicLink: string): string {
    return this.environment.render('signup.njk', { signupMagicLink });
  }

  /**
   *
   */
  public renderEmailChangeEmailHtml(emailChangeMagicLink: string): string {
    return this.environment.render('email-change.njk', {
      emailChangeMagicLink,
    });
  }

  /**
   *
   */
  public renderNewAssignmentEmailHtml(): string {
    return this.environment.render('new-assignment.njk');
  }

  /**
   *
   */
  public renderUnregisteredUserNewAssignmentEmailHtml(): string {
    return this.environment.render('unregistered-user-new-assignment.njk');
  }
}
