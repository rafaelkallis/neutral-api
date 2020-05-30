import { Injectable } from '@nestjs/common';
import { Config } from 'shared/config/application/Config';
import { Email } from 'user/domain/value-objects/Email';

export interface CreateLoginLinkContext {
  readonly loginToken: string;
  readonly email: Email;
  readonly isNew?: boolean;
}

@Injectable()
export class MagicLinkFactory {
  private readonly config: Config;

  public constructor(config: Config) {
    this.config = config;
  }

  public createLoginLink(ctx: CreateLoginLinkContext): string {
    const loginUrl = new URL(
      '/login/callback',
      this.config.get('FRONTEND_URL'),
    );
    loginUrl.searchParams.append('token', ctx.loginToken);
    loginUrl.searchParams.append('email', ctx.email.value);
    if (ctx.isNew) {
      loginUrl.searchParams.append('new', 'true');
    }
    return loginUrl.href;
  }
}
