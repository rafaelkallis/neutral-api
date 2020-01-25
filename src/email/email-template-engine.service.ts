export const EMAIL_TEMPLATE_ENGINE = Symbol('EMAIL_TEMPLATE_ENGINE');

/**
 * Email Template Engine
 */
export interface EmailTemplateEngineService {
  /**
   *
   */
  renderLoginEmail(loginMagicLink: string): Promise<string>;

  /**
   *
   */
  renderSignupEmail(signupMagicLink: string): Promise<string>;

  /**
   *
   */
  renderEmailChangeEmail(emailChangeMagicLink: string): Promise<string>;

  /**
   *
   */
  renderNewAssignmentEmail(): Promise<string>;

  /**
   *
   */
  renderUnregisteredUserNewAssignmentEmail(): Promise<string>;
}
