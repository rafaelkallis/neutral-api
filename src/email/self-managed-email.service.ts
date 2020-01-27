import { Injectable, NotImplementedException } from '@nestjs/common';
import { EmailSenderService, InjectEmailSender } from 'email/email-sender';
import { EmailService } from 'email/email.service';
import {
  InjectEmailHtmlRenderer,
  EmailHtmlRendererService,
} from 'email/email-html-renderer/email-html-renderer.service';
import {
  EmailPlaintextRendererService,
  InjectEmailPlaintextRenderer,
} from 'email/email-plaintext-renderer/email-plaintext-renderer.service';

/**
 * Self Managed Email Service
 */
@Injectable()
export class SelfManagedEmailService implements EmailService {
  private readonly emailHtmlRenderer: EmailHtmlRendererService;
  private readonly emailPlaintextRenderer: EmailPlaintextRendererService;
  private readonly emailSender: EmailSenderService;

  public constructor(
    @InjectEmailHtmlRenderer()
    emailHtmlRenderer: EmailHtmlRendererService,
    @InjectEmailPlaintextRenderer()
    emailPlaintextRenderer: EmailPlaintextRendererService,
    @InjectEmailSender() emailSender: EmailSenderService,
  ) {
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
  public async sendUnregisteredUserNewAssignmentEmail(
    to: string,
  ): Promise<void> {
    const subject = '[Covee] assignment invitation';
    const html = this.emailHtmlRenderer.renderUnregisteredUserNewAssignmentEmailHtml();
    const text = this.emailPlaintextRenderer.renderUnregisteredUserNewAssignmentEmailPlaintext();
    await this.emailSender.sendEmail({ to, subject, html, text });
  }
}
