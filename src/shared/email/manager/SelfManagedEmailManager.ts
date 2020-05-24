import { Injectable } from '@nestjs/common';
import { EmailSender } from 'shared/email/sender/EmailSender';
import {
  EmailManager,
  InvitedUserNewAssignmentModel,
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
    loginMagicLink: string,
  ): Promise<void> {
    const subject = '[Covee] magic login link';
    const html = this.emailHtmlRenderer.renderLoginEmailHtml(loginMagicLink);
    const text = this.emailPlaintextRenderer.renderLoginEmailPlaintext(
      loginMagicLink,
    );
    await this.emailSender.sendEmail({ to, subject, html, text });
  }

  public async sendSignupEmail(
    to: string,
    signupMagicLink: string,
  ): Promise<void> {
    const subject = '[Covee] magic signup link';
    const html = this.emailHtmlRenderer.renderSignupEmailHtml(signupMagicLink);
    const text = this.emailPlaintextRenderer.renderSignupEmailPlaintext(
      signupMagicLink,
    );
    await this.emailSender.sendEmail({ to, subject, html, text });
  }

  public async sendEmailChangeEmail(
    to: string,
    emailChangeMagicLink: string,
  ): Promise<void> {
    const subject = '[Covee] email change confirmation';
    const html = this.emailHtmlRenderer.renderEmailChangeEmailHtml(
      emailChangeMagicLink,
    );
    const text = this.emailPlaintextRenderer.renderEmailChangeEmailPlaintext(
      emailChangeMagicLink,
    );
    await this.emailSender.sendEmail({ to, subject, html, text });
  }

  /**
   * Sends an email to a user that was assigned to a role.
   */
  public async sendNewAssignmentEmail(to: string): Promise<void> {
    const subject = '[Covee] new assignment';
    const html = this.emailHtmlRenderer.renderNewAssignmentEmailHtml();
    const text = this.emailPlaintextRenderer.renderNewAssignmentEmailPlaintext();
    await this.emailSender.sendEmail({ to, subject, html, text });
  }

  /**
   * Sends an email to a user that is not registered but was assigned to a new role.
   */
  public async sendInvitedUserNewAssignmentEmail(
    to: string,
    model: InvitedUserNewAssignmentModel,
  ): Promise<void> {
    const subject = '[Covee] new assignment';
    const html = this.emailHtmlRenderer.renderInvitedUserNewAssignmentEmailHtml(
      model,
    );
    const text = this.emailPlaintextRenderer.renderInvitedUserNewAssignmentEmailPlaintext(
      model,
    );
    await this.emailSender.sendEmail({ to, subject, html, text });
  }
}
