import { Injectable } from '@nestjs/common';
import { EmailHtmlRenderer } from 'shared/email/html-renderer/EmailHtmlRenderer';
import { Environment as NunjucksRenderer } from 'nunjucks';
import fs from 'fs';
import path from 'path';
import mjml2html from 'mjml';

/**
 * Mjml Email Html Renderer
 * @see https://mjml.io/
 *
 * PRODUCTION CHECKLIST:
 * - compile mjml during build
 * - async file read
 * - cache read files
 */
@Injectable()
export class MjmlEmailHtmlRenderer extends EmailHtmlRenderer {
  private readonly nunjucksRenderer: NunjucksRenderer;

  public constructor() {
    super();
    this.nunjucksRenderer = new NunjucksRenderer();
  }

  public renderLoginEmailHtml(loginMagicLink: string): string {
    return this.render('login.mjml', { loginMagicLink });
  }

  public renderSignupEmailHtml(signupMagicLink: string): string {
    throw new Error('Method not implemented.');
  }
  public renderEmailChangeEmailHtml(emailChangeMagicLink: string): string {
    throw new Error('Method not implemented.');
  }
  public renderNewAssignmentEmailHtml(): string {
    throw new Error('Method not implemented.');
  }
  public renderUnregisteredUserNewAssignmentEmailHtml(): string {
    throw new Error('Method not implemented.');
  }

  private render(templateName: string, context: object): string {
    const mjmlTemplatePath = path.join(__dirname, 'templates', templateName);
    const mjmlTemplateBuf = fs.readFileSync(mjmlTemplatePath);
    const mjmlTemplate = mjmlTemplateBuf.toString();
    const { html: njkTemplate, errors } = mjml2html(mjmlTemplate);
    if (errors.length > 0) {
      throw new Error();
    }
    const html = this.nunjucksRenderer.renderString(njkTemplate, context);
    return html;
  }
}
