import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { UnauthorizedUserException } from 'auth/application/exceptions/UnauthorizedUserException';
import { TokenManager } from 'shared/token/application/TokenManager';
import { UserRepository } from 'user/domain/UserRepository';
import { ReadonlyUser } from 'user/domain/User';
import { UserId } from 'user/domain/value-objects/UserId';
import { ForgottenState } from 'user/domain/value-objects/states/ForgottenState';

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
    if (!authHeader) {
      /* throw if no authorization scheme is used */
      throw new UnauthorizedUserException();
    }
    const [scheme, parameter] = authHeader.split(' ');
    if (!scheme || scheme.toLowerCase() !== 'bearer') {
      throw new UnauthorizedUserException();
    }
    const payload = this.tokenService.validateAccessToken(parameter);
    const userId = UserId.from(payload.sub);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedUserException();
    }
    if (user.state === ForgottenState.getInstance()) {
      throw new UnauthorizedUserException();
    }
    req.user = user;
    return true;
  }
}

export const AuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ReadonlyUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
