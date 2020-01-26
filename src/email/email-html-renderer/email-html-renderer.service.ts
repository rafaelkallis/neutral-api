import { Inject } from '@nestjs/common';

export const EMAIL_HTML_RENDERER = Symbol('EMAIL_HTML_RENDERER');

export function InjectEmailHtmlRenderer(): ParameterDecorator {
  return Inject(EMAIL_HTML_RENDERER);
}

/**
 *
 */
export interface EmailHtmlRendererService {
  /**
   *
   */
  renderLoginEmailHtml(loginMagicLink: string): string;

  /**
   *
   */
  renderSignupEmailHtml(signupMagicLink: string): string;

  /**
   *
   */
  renderEmailChangeEmailHtml(emailChangeMagicLink: string): string;

  /**
   *
   */
  renderNewAssignmentEmailHtml(): string;

  /**
   *
   */
  renderUnregisteredUserNewAssignmentEmailHtml(): string;
}
