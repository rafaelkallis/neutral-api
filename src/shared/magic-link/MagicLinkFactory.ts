import { Injectable } from '@nestjs/common';
import { Config } from 'shared/config/application/Config';
import { Email } from 'user/domain/value-objects/Email';

export interface CreateLoginLinkContext {
  readonly loginToken: string;
  readonly email: Email;
  readonly isNew?: true;
}

@Injectable()
export class MagicLinkFactory {
  private readonly config: Config;

  public constructor(config: Config) {
    this.config = config;
  }

  public createLoginLink(ctx: CreateLoginLinkContext): string {
    let loginLink = this.config.get('FRONTEND_URL');
    loginLink += '/login/callback';
    loginLink += `?token=${ctx.loginToken}`;
    loginLink += `&email=${ctx.email.value}`;
    if (ctx.isNew) {
      loginLink += `&new=true`;
    }
    return encodeURI(loginLink);
  }
}
