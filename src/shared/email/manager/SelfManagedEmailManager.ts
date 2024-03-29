import { Injectable } from '@nestjs/common';
import { EmailSender } from 'shared/email/sender/EmailSender';
import {
  EmailManager,
  RoleCtaModel,
  ProjectCtaModel,
  CtaModel,
  CtaModelWithFirstName,
} from 'shared/email/manager/EmailManager';
import { EmailPlaintextRenderer } from 'shared/email/plaintext-renderer/EmailPlaintextRenderer';
import { EmailHtmlRenderer } from 'shared/email/html-renderer/EmailHtmlRenderer';

/**
 * Self Managed Email Manager
 */
@Injectable()
export class SelfManagedEmailManager extends EmailManager {
  private readonly emailHtmlRenderer: EmailHtmlRenderer;
  private readonly emailPlaintextRenderer: EmailPlaintextRenderer;
  private readonly emailSender: EmailSender;

  public constructor(
    emailHtmlRenderer: EmailHtmlRenderer,
    emailPlaintextRenderer: EmailPlaintextRenderer,
    emailSender: EmailSender,
  ) {
    super();
    this.emailHtmlRenderer = emailHtmlRenderer;
    this.emailPlaintextRenderer = emailPlaintextRenderer;
    this.emailSender = emailSender;
  }

  public async sendLoginEmail(
    to: string,
    model: CtaModelWithFirstName,
  ): Promise<void> {
    const subject = '[Covee] magic login link';
    const html = this.emailHtmlRenderer.renderLoginEmailHtml(model);
    const text = this.emailPlaintextRenderer.renderLoginEmailPlaintext(model);
    await this.emailSender.sendEmail({ to, subject, html, text });
  }

  public async sendSignupEmail(to: string, model: CtaModel): Promise<void> {
    const subject = '[Covee] magic signup link';
    const html = this.emailHtmlRenderer.renderSignupEmailHtml(model);
    const text = this.emailPlaintextRenderer.renderSignupEmailPlaintext(model);
    await this.emailSender.sendEmail({ to, subject, html, text });
  }

  public async sendEmailChangeEmail(
    to: string,
    model: CtaModelWithFirstName,
  ): Promise<void> {
    const subject = '[Covee] email change confirmation';
    const html = this.emailHtmlRenderer.renderEmailChangeEmailHtml(model);
    const text = this.emailPlaintextRenderer.renderEmailChangeEmailPlaintext(
      model,
    );
    await this.emailSender.sendEmail({ to, subject, html, text });
  }

  /**
   * Sends an email to a user that was assigned to a role.
   */
  public async sendNewAssignmentEmail(
    to: string,
    model: RoleCtaModel,
  ): Promise<void> {
    const subject = `[Covee] new assignment in "${model.projectTitle}"`;
    const html = this.emailHtmlRenderer.renderNewAssignmentEmailHtml(model);
    const text = this.emailPlaintextRenderer.renderNewAssignmentEmailPlaintext(
      model,
    );
    await this.emailSender.sendEmail({ to, subject, html, text });
  }

  public async sendPeerReviewRequestedEmail(
    to: string,
    model: ProjectCtaModel,
  ): Promise<void> {
    const subject = `[Covee] peer-review requested in "${model.projectTitle}"`;
    const html = this.emailHtmlRenderer.renderPeerReviewRequestedEmailHtml(
      model,
    );
    const text = this.emailPlaintextRenderer.renderPeerReviewRequestedEmailPlaintext(
      model,
    );
    await this.emailSender.sendEmail({ to, subject, html, text });
  }

  public async sendManagerReviewRequestedEmail(
    to: string,
    model: ProjectCtaModel,
  ): Promise<void> {
    const subject = `[Covee] manager-review requested in "${model.projectTitle}"`;
    const html = this.emailHtmlRenderer.renderManagerReviewRequestedEmailHtml(
      model,
    );
    const text = this.emailPlaintextRenderer.renderManagerReviewRequestedEmailPlaintext(
      model,
    );
    await this.emailSender.sendEmail({ to, subject, html, text });
  }

  public async sendProjectFinishedEmail(
    to: string,
    model: ProjectCtaModel,
  ): Promise<void> {
    const subject = `[Covee] project "${model.projectTitle}" finished`;
    const html = this.emailHtmlRenderer.renderProjectFinishedEmailHtml(model);
    const text = this.emailPlaintextRenderer.renderProjectFinishedEmailPlaintext(
      model,
    );
    await this.emailSender.sendEmail({ to, subject, html, text });
  }
}
