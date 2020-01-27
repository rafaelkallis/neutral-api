import { Injectable, NotImplementedException } from '@nestjs/common';
import { EmailPlaintextRendererService } from 'email/email-plaintext-renderer/email-plaintext-renderer.service';

/**
 * Default Email Plaintext Renderer
 */
@Injectable()
export class DefaultEmailPlaintextRendererService
  implements EmailPlaintextRendererService {
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
    throw new NotImplementedException();
  }

  /**
   *
   */
  public renderNewAssignmentEmailPlaintext(): string {
    throw new NotImplementedException();
  }

  /**
   *
   */
  public renderUnregisteredUserNewAssignmentEmailPlaintext(): string {
    throw new NotImplementedException();
  }
}
