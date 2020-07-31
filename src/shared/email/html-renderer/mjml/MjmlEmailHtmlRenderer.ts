import { Injectable, Logger } from '@nestjs/common';
import { EmailHtmlRenderer } from 'shared/email/html-renderer/EmailHtmlRenderer';
import { Environment as NunjucksRenderer, FileSystemLoader } from 'nunjucks';
import path from 'path';
import mjml2html from 'mjml';
import { Environment } from 'shared/utility/application/Environment';
import {
  RoleCtaModel,
  ProjectCtaModel,
  CtaModelWithFirstName,
  CtaModel,
} from 'shared/email/manager/EmailManager';

/**
 * Mjml Email Html Renderer
 * @see https://mjml.io/
 */
@Injectable()
export class MjmlEmailHtmlRenderer extends EmailHtmlRenderer {
  private readonly logger: Logger;
  private readonly environment: Environment;
  private readonly nunjucksRenderer: NunjucksRenderer;

  public constructor(environment: Environment) {
    super();
    this.logger = new Logger(MjmlEmailHtmlRenderer.name);
    this.environment = environment;
    const mjmlTemplatesPath = path.resolve(
      __dirname,
      '../../../../..',
      'assets/email-templates/mjml',
    );
    this.logger.log(`loading templates from "${mjmlTemplatesPath}"`);
    const fileSystemLoader = new FileSystemLoader(mjmlTemplatesPath);
    this.nunjucksRenderer = new NunjucksRenderer(fileSystemLoader);
  }

  public renderLoginEmailHtml(model: CtaModelWithFirstName): string {
    return this.render('login', model);
  }

  public renderSignupEmailHtml(model: CtaModel): string {
    return this.render('signup', model);
  }
  public renderEmailChangeEmailHtml(model: CtaModelWithFirstName): string {
    return this.render('email-change', model);
  }
  public renderNewAssignmentEmailHtml(model: RoleCtaModel): string {
    return this.render('new-assignment', model);
  }
  public renderPeerReviewRequestedEmailHtml(model: ProjectCtaModel): string {
    return this.render('peer-review-requested', model);
  }
  public renderManagerReviewRequestedEmailHtml(model: ProjectCtaModel): string {
    return this.render('manager-review-requested', model);
  }
  public renderProjectFinishedEmailHtml(model: ProjectCtaModel): string {
    return this.render('project-finished', model);
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
      throw new Error(
        `${MjmlEmailHtmlRenderer.name} error: ${errors[0].formattedMessage}`,
      );
    }
    return html;
  }
}
