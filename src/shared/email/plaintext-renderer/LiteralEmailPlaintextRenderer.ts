import { Injectable } from '@nestjs/common';
import { EmailPlaintextRenderer } from 'shared/email/plaintext-renderer/EmailPlaintextRenderer';

/**
 * Literal Email Plaintext Renderer
 */
@Injectable()
export class LiteralEmailPlaintextRenderer extends EmailPlaintextRenderer {
  public renderLoginEmailPlaintext(loginMagicLink: string): string {
    return `
      Hi there,

      Here's the magic login link you have requested:

      >> Covee Login
      ${loginMagicLink}
    `;
  }

  /**
   *
   */
  public renderSignupEmailPlaintext(signupMagicLink: string): string {
    return `
      Hi there,

      Here's the magic signup link you have requested:

      >> Covee Signup
      ${signupMagicLink}
    `;
  }

  /**
   *
   */
  public renderEmailChangeEmailPlaintext(emailChangeMagicLink: string): string {
    return `
      Hi there,

      Here's the magic email-change link you have requested:

      >> Confirm Email
      ${emailChangeMagicLink}
    `;
  }

  /**
   *
   */
  public renderNewAssignmentEmailPlaintext(): string {
    return `
      Hi there,

      You have a new assignment.
    `;
  }

  /**
   *
   */
  public renderUnregisteredUserNewAssignmentEmailPlaintext(): string {
    return `
      Hi there,

      You have a new assignment.
    `;
  }
}
