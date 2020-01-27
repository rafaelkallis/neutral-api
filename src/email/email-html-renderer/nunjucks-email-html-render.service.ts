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
    const title = 'Covee Magic Login';
    const preheader = 'Your magic login link has arrived.';
    return this.environment.render('login.njk', {
      title,
      preheader,
      loginMagicLink,
    });
  }

  /**
   *
   */
  public renderSignupEmailHtml(signupMagicLink: string): string {
    const title = 'Covee Magic Signup';
    const preheader = 'Your magic signup link has arrived.';
    return this.environment.render('signup.njk', {
      title,
      preheader,
      signupMagicLink,
    });
  }

  /**
   *
   */
  public renderEmailChangeEmailHtml(emailChangeMagicLink: string): string {
    throw new NotImplementedException();
  }

  /**
   *
   */
  public renderNewAssignmentEmailHtml(): string {
    throw new NotImplementedException();
  }

  /**
   *
   */
  public renderUnregisteredUserNewAssignmentEmailHtml(): string {
    throw new NotImplementedException();
  }
}
