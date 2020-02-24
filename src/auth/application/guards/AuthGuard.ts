import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  Inject,
} from '@nestjs/common';

import { UnauthorizedUserException } from 'auth/application/exceptions/UnauthorizedUserException';
import { SessionState } from 'session';
import { TOKEN_MANAGER, TokenManager } from 'token/application/TokenManager';
import { Id } from 'common/domain/value-objects/Id';
import {
  UserRepository,
  InjectUserRepository,
} from 'user/domain/UserRepository';
import { User } from 'user/domain/User';

/**
 * Auth Guard.
 *
 * Retrieves the session state either from cookies or the authorization header.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly tokenService: TokenManager;
  private readonly userRepository: UserRepository;

  public constructor(
    @InjectUserRepository() userRepository: UserRepository,
    @Inject(TOKEN_MANAGER) tokenService: TokenManager,
  ) {
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
    // TODO chain of responsibility pattern
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

  private async handleSessionAuth(session: SessionState): Promise<User> {
    const payload = this.tokenService.validateSessionToken(session.get());
    const user = await this.userRepository.findById(Id.from(payload.sub));
    if (!user) {
      throw new UnauthorizedUserException();
    }
    const newSessionToken = this.tokenService.newSessionToken(
      user.id.value,
      payload.maxAge,
    );
    session.set(newSessionToken);
    return user;
  }

  private async handleAuthHeaderAuth(authHeader: string): Promise<User> {
    const [prefix, content] = authHeader.split(' ');
    if (!prefix || prefix.toLowerCase() !== 'bearer') {
      throw new UnauthorizedUserException();
    }
    const payload = this.tokenService.validateAccessToken(content);
    const user = await this.userRepository.findById(Id.from(payload.sub));
    if (!user) {
      throw new UnauthorizedUserException();
    }
    return user;
  }
}

export const AuthUser = createParamDecorator((_, req): User => req.user);
