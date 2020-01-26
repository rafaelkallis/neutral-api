import { Inject } from '@nestjs/common';

export const EMAIL_PLAINTEXT_RENDERER = Symbol('EMAIL_PLAINTEXT_RENDERER');

export function InjectEmailPlaintextRenderer(): ParameterDecorator {
  return Inject(EMAIL_PLAINTEXT_RENDERER);
}

/**
 *
 */
export interface EmailPlaintextRendererService {
  /**
   *
   */
  renderLoginEmailPlaintext(loginMagicLink: string): string;

  /**
   *
   */
  renderSignupEmailPlaintext(signupMagicLink: string): string;

  /**
   *
   */
  renderEmailChangeEmailPlaintext(emailChangeMagicLink: string): string;

  /**
   *
   */
  renderNewAssignmentEmailPlaintext(): string;

  /**
   *
   */
  renderUnregisteredUserNewAssignmentEmailPlaintext(): string;
}
