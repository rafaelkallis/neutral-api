import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { User } from '../entities/user.entity';
import { UnauthorizedUserException } from '../exceptions/unauthorized-user.exception';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from '../services/token.service';

/**
 * Auth Guard.
 *
 * Retrieves the session state either from cookies or the authorization header.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly tokenService: TokenService;
  private readonly userRepository: UserRepository;
  public constructor(
    tokenService: TokenService,
    userRepository: UserRepository,
  ) {
    this.tokenService = tokenService;
    this.userRepository = userRepository;
  }

  /**
   * Guard handle
   */
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const session: string | undefined = req.session.get();
    const authHeader: string | undefined = req.header('Authorization');
    let token = session;
    if (authHeader) {
      const [prefix, content] = authHeader.split(' ');
      if (!prefix || prefix.toLowerCase() !== 'bearer') {
        throw new UnauthorizedUserException();
      }
      token = content;
    }
    if (!token) {
      throw new UnauthorizedUserException();
    }
    const payload = this.tokenService.validateAccessToken(token);
    req.user = await this.userRepository.findOne({ id: payload.sub });
    if (!req.user) {
      throw new UnauthorizedUserException();
    }
    return true;
  }
}

export const AuthUser = createParamDecorator((_, req): User => req.user);
