import { Injectable } from '@nestjs/common';
import { Environment, FileSystemLoader } from 'nunjucks';
import path from 'path';
import { EmailHtmlRenderer } from 'shared/email/html-renderer/EmailHtmlRenderer';
import {
  CtaModelWithFirstName,
  CtaModel,
} from 'shared/email/manager/EmailManager';

/**
 * Nunjucks Email Html Renderer
 */
@Injectable()
export class NunjucksEmailHtmlRenderer extends EmailHtmlRenderer {
  private readonly environment: Environment;

  public constructor() {
    super();
    const templatesPath = path.resolve(__dirname, 'templates');
    const fileSystemLoader = new FileSystemLoader(templatesPath);
    this.environment = new Environment(fileSystemLoader);
  }

  public renderLoginEmailHtml(model: CtaModelWithFirstName): string {
    return this.environment.render('login.njk', model);
  }

  /**
   *
   */
  public renderSignupEmailHtml(model: CtaModel): string {
    return this.environment.render('signup.njk', model);
  }

  /**
   *
   */
  public renderEmailChangeEmailHtml(model: CtaModelWithFirstName): string {
    return this.environment.render('email-change.njk', model);
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
  public renderInvitedUserNewAssignmentEmailHtml(): string {
    return this.environment.render('unregistered-user-new-assignment.njk');
  }

  public renderPeerReviewRequestedEmailHtml(): string {
    throw new Error('not implemented');
  }

  public renderManagerReviewRequestedEmailHtml(): string {
    throw new Error('not implemented');
  }

  public renderProjectFinishedEmailHtml(): string {
    throw new Error('not implemented');
  }
}
