import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { UnauthorizedUserException } from 'auth/application/exceptions/UnauthorizedUserException';
import { SessionState } from 'shared/session';
import { TokenManager } from 'shared/token/application/TokenManager';
import { UserRepository } from 'user/domain/UserRepository';
import { User } from 'user/domain/User';
import { UserId } from 'user/domain/value-objects/UserId';

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
    userRepository: UserRepository,
    tokenService: TokenManager,
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
    const userId = UserId.from(payload.sub);
    const optionalUser = await this.userRepository.findById(userId);
    const user = optionalUser.orElseThrow(UnauthorizedUserException);
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
    const userId = UserId.from(payload.sub);
    const user = await this.userRepository.findById(userId);
    return user.orElseThrow(UnauthorizedUserException);
  }
}

export const AuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
