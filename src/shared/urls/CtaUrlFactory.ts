import { Injectable } from '@nestjs/common';
import { Config } from 'shared/config/application/Config';
import { ReadonlyUser } from 'user/domain/User';
import { TokenManager } from 'shared/token/application/TokenManager';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';

export interface CreateCtaUrlContext {
  readonly user: ReadonlyUser;
}

export interface CreateProjectCtaUrlContext extends CreateCtaUrlContext {
  readonly projectId: ProjectId;
}

@Injectable()
export class CtaUrlFactory {
  private readonly config: Config;
  private readonly tokenManager: TokenManager;

  public constructor(config: Config, tokenManager: TokenManager) {
    this.config = config;
    this.tokenManager = tokenManager;
  }

  public createPeerReviewRequestedUrl(ctx: CreateProjectCtaUrlContext): string {
    return this.createCtaUrl(
      ctx.user,
      `/projects/${ctx.projectId.value}/submit-peer-review`,
    );
  }

  private createCtaUrl(user: ReadonlyUser, redirectUrl: string): string {
    const ctaUrl = new URL('/callback', this.config.get('FRONTEND_URL'));
    const loginToken = this.tokenManager.newLoginToken(
      user.email,
      user.lastLoginAt,
    );
    ctaUrl.searchParams.append('token', loginToken);
    ctaUrl.searchParams.append('redirectUrl', redirectUrl);
    if (user.isPending()) {
      ctaUrl.searchParams.append('new', 'true');
    }
    return ctaUrl.href;
  }
}
