import {
  CanActivate,
  ExecutionContext,
  Injectable,
  createParamDecorator,
} from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { ConfigService } from '../services/config.service';
import { UserRepository } from '../repositories/user.repository';
import { UnauthorizedUserException } from '../exceptions/unauthorized-user.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private tokenService: TokenService,
    private userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const session: string | undefined = req.session.get();
    const authHeader: string | undefined = req.header('Authorization');
    if (!session && !authHeader) {
      throw new UnauthorizedUserException();
    }
    let token = session;
    if (authHeader) {
      const [prefix, content] = authHeader.split(' ');
      if (!prefix || prefix.toLowerCase() !== 'bearer') {
        throw new UnauthorizedUserException();
      }
      token = content;
    }
    const payload = this.tokenService.validateAccessToken(token);
    req.user = await this.userRepository.findOne({ id: payload.sub });
    if (!req.user) {
      throw new UnauthorizedUserException();
    }
    return true;
  }
}

export const AuthUser = createParamDecorator((data, req) => req.user);
