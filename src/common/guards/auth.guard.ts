import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { UserEntity } from '../entities/user.entity';
import { UnauthorizedUserException } from '../exceptions/unauthorized-user.exception';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from '../services/token.service';
import { ConfigService } from '../services/config.service';
import { SessionState } from '../middlewares/session.middleware';

/**
 * Auth Guard.
 *
 * Retrieves the session state either from cookies or the authorization header.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly tokenService: TokenService;
  private readonly configService: ConfigService;
  private readonly userRepository: UserRepository;
  public constructor(
    tokenService: TokenService,
    configService: ConfigService,
    userRepository: UserRepository,
  ) {
    this.tokenService = tokenService;
    this.configService = configService;
    this.userRepository = userRepository;
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
    const user = await this.userRepository.findOne({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedUserException();
    }
    const newSessionToken = this.tokenService.newSessionToken(
      user.id,
      payload.maxAge,
    );
    session.set(
      newSessionToken,
      this.configService.get('SESSION_TOKEN_LIFETIME_MIN'),
    );
    return user;
  }

  private async handleAuthHeaderAuth(authHeader: string): Promise<UserEntity> {
    const [prefix, content] = authHeader.split(' ');
    if (!prefix || prefix.toLowerCase() !== 'bearer') {
      throw new UnauthorizedUserException();
    }
    const payload = this.tokenService.validateAccessToken(content);
    const user = await this.userRepository.findOne({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedUserException();
    }
    return user;
  }
}

export const AuthUser = createParamDecorator((_, req): UserEntity => req.user);
