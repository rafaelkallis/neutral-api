import { Injectable } from '@nestjs/common';
import { TokenManager } from 'shared/token/application/TokenManager';
import { Config } from 'shared/config/application/Config';
import { Email } from 'user/domain/value-objects/Email';

@Injectable()
export class MagicLinkFactory {
  private readonly config: Config;
  private readonly tokenManager: TokenManager;

  public constructor(config: Config, tokenManager: TokenManager) {
    this.tokenManager = tokenManager;
    this.config = config;
  }

  public createSignupLink(email: Email): string {
    const signupToken = this.tokenManager.newSignupToken(email.value);
    const uriSafeSignupToken = encodeURIComponent(signupToken);
    const frontendUrl = this.config.get('FRONTEND_URL');
    const signupLink = `${frontendUrl}/signup/callback?token=${uriSafeSignupToken}`;
    return signupLink;
  }
}
