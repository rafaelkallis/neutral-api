import { Injectable } from '@nestjs/common';
import { EmailHtmlRenderer } from 'shared/email/html-renderer/EmailHtmlRenderer';
import { Environment as NunjucksRenderer, FileSystemLoader } from 'nunjucks';
import path from 'path';
import mjml2html from 'mjml';
import { Environment } from 'shared/utility/application/Environment';
import {
  InvitedUserNewAssignmentModel,
  NewAssignmentModel,
  PeerReviewRequestedModel,
} from 'shared/email/manager/EmailManager';

/**
 * Mjml Email Html Renderer
 * @see https://mjml.io/
 */
@Injectable()
export class MjmlEmailHtmlRenderer extends EmailHtmlRenderer {
  private readonly environment: Environment;
  private readonly nunjucksRenderer: NunjucksRenderer;

  public constructor(environment: Environment) {
    super();
    this.environment = environment;
    const mjmlTemplatesPath = path.resolve(__dirname, 'templates');
    const fileSystemLoader = new FileSystemLoader(mjmlTemplatesPath);
    this.nunjucksRenderer = new NunjucksRenderer(fileSystemLoader);
  }

  public renderLoginEmailHtml(loginMagicLink: string): string {
    return this.render('login', { loginMagicLink });
  }

  public renderSignupEmailHtml(signupMagicLink: string): string {
    return this.render('signup', { signupMagicLink });
  }
  public renderEmailChangeEmailHtml(emailChangeMagicLink: string): string {
    return this.render('email-change', { emailChangeMagicLink });
  }
  public renderNewAssignmentEmailHtml(model: NewAssignmentModel): string {
    return this.render('new-assignment', model);
  }
  public renderInvitedUserNewAssignmentEmailHtml(
    model: InvitedUserNewAssignmentModel,
  ): string {
    return this.render('invited-new-assignment', model);
  }
  public renderPeerReviewRequestedEmailHtml(
    model: PeerReviewRequestedModel,
  ): string {
    return this.render('peer-review-requested', model);
  }

  private render(templateName: string, context: object): string {
    const mjmlString = this.nunjucksRenderer.render(
      `${templateName}.njk`,
      context,
    );
    const validationLevel = this.environment.isDevelopment()
      ? 'strict'
      : 'skip';
    const { html, errors } = mjml2html(mjmlString, { validationLevel });
    if (errors.length > 0) {
      // TODO improve error handling
      throw new Error();
    }
    return html;
  }
}
