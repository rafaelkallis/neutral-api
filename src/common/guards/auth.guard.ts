import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
  InternalServerErrorException,
} from '@nestjs/common';
import { TokenService } from '../services/token/token.service';
import { ConfigService } from '../services/config/config.service';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private tokenService: TokenService,
    private userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authCookie: string | undefined =
      req.cookies[this.configService.get('ACCESS_TOKEN_COOKIE_NAME')];
    const authHeader: string | undefined = req.header('Authorization');
    if (!authCookie && !authHeader) {
      throw new UnauthorizedException();
    }
    let token = authCookie;
    if (authHeader) {
      const [prefix, content] = authHeader.split(' ');
      if (!prefix || prefix.toLowerCase() !== 'bearer') {
        throw new UnauthorizedException();
      }
      token = content;
    }
    const payload = this.tokenService.validateAccessToken(token);
    req.authUser = await this.userRepository.findOneOrFailWith(
      { id: payload.sub },
      new UnauthorizedException(),
    );
    return true;
  }
}

export const AuthUser = createParamDecorator((data, req) => req.authUser);
