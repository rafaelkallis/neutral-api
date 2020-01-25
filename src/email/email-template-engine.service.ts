export const EMAIL_TEMPLATE_ENGINE = Symbol('EMAIL_TEMPLATE_ENGINE');

/**
 * Email Template Engine
 */
export interface EmailTemplateEngineService {
  /**
   *
   */
  renderLoginHtml(loginMagicLink: string): Promise<string>;

  /**
   *
   */
  renderSignupHtml(signupMagicLink: string): Promise<string>;

  /**
   *
   */
  renderEmailChangeHtml(emailChangeMagicLink: string): Promise<string>;

  /**
   *
   */
  renderNewAssignmentHtml(): Promise<string>;

  /**
   *
   */
  renderUnregisteredUserNewAssignmentHtml(): Promise<string>;
}
