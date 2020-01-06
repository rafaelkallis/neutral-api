import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  Inject,
} from '@nestjs/common';

import { UserEntity, UserRepository, USER_REPOSITORY } from 'user';
import { TokenService } from 'common';
import { UnauthorizedUserException } from '../exceptions/unauthorized-user.exception';
import { SessionState } from '../middlewares/session.middleware';
import { Config, CONFIG } from 'config';

/**
 * Auth Guard.
 *
 * Retrieves the session state either from cookies or the authorization header.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly config: Config;
  private readonly tokenService: TokenService;
  private readonly userRepository: UserRepository;

  public constructor(
    @Inject(CONFIG) config: Config,
    @Inject(USER_REPOSITORY) userRepository: UserRepository,
    tokenService: TokenService,
  ) {
    this.config = config;
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  /**
   * Guard handle
   */
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader: string | undefined = req.header('Authorization');
    const session: SessionState = req.session;
    if (!session.exists() && !authHeader) {
      /* throw if no authorization scheme is used */
      throw new UnauthorizedUserException();
    }
    if (session.exists() && authHeader) {
      /* throw if multiple authorization schemes are used */
      throw new UnauthorizedUserException();
    }
    if (session.exists()) {
      req.user = await this.handleSessionAuth(session);
    }
    if (authHeader) {
      req.user = await this.handleAuthHeaderAuth(authHeader);
    }
    return true;
  }

  private async handleSessionAuth(session: SessionState): Promise<UserEntity> {
    const payload = this.tokenService.validateSessionToken(session.get());
    const user = await this.userRepository.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedUserException();
    }
    const newSessionToken = this.tokenService.newSessionToken(
      user.id,
      payload.maxAge,
    );
    session.set(newSessionToken, this.config.get('SESSION_TOKEN_LIFETIME_MIN'));
    return user;
  }

  private async handleAuthHeaderAuth(authHeader: string): Promise<UserEntity> {
    const [prefix, content] = authHeader.split(' ');
    if (!prefix || prefix.toLowerCase() !== 'bearer') {
      throw new UnauthorizedUserException();
    }
    const payload = this.tokenService.validateAccessToken(content);
    const user = await this.userRepository.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedUserException();
    }
    return user;
  }
}

export const AuthUser = createParamDecorator((_, req): UserEntity => req.user);
