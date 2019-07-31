import { Injectable } from '@nestjs/common';
import {
  User,
  UserRepository,
  UserNotFoundException,
  EmailNotFoundException,
} from '../user';
import {
  TokenService,
  RandomService,
  EmailService,
  ConfigService,
} from '../common';
import { EmailAlreadyUsedException } from './exceptions';
import { RequestLoginDto, RequestSignupDto, SubmitSignupDto } from './dto';
import * as moment from 'moment';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private tokenService: TokenService,
    private randomService: RandomService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async requestLoginToken(dto: RequestLoginDto) {
    const { email } = dto;
    const user = await this.userRepository.findOneOrFailWith(
      { email },
      new EmailNotFoundException(),
    );
    const loginToken = this.tokenService.newLoginToken(user.id);
    const magicLoginLink = `${this.configService.get(
      'FRONTEND_URL',
    )}/login/callback?token=${encodeURIComponent(loginToken)}`;
    await this.emailService.sendLoginEmail(email, magicLoginLink);
  }

  async submitLoginToken(loginToken: string) {
    const payload = this.tokenService.validateLoginToken(loginToken);
    const user = await this.userRepository.findOneOrFailWith(
      { id: payload.sub },
      new UserNotFoundException(),
    );
    const accessToken = this.tokenService.newAccessToken(user.id);
    const refreshToken = this.tokenService.newRefreshToken(user.id);
    return { accessToken, refreshToken };
  }

  async requestSignupToken(dto: RequestSignupDto) {
    const { email } = dto;
    const user = await this.userRepository.findOne({ email });
    if (user) {
      throw new EmailAlreadyUsedException();
    }
    const signupToken = this.tokenService.newSignupToken(email);
    const magicSignupLink = `${this.configService.get(
      'FRONTEND_URL',
    )}/signup/callback?token=${encodeURIComponent(signupToken)}`;
    await this.emailService.sendSignupEmail(email, magicSignupLink);
  }

  async submitSignupToken(submitToken: string, dto: SubmitSignupDto) {
    const payload = this.tokenService.validateSignupToken(submitToken);
    const count = await this.userRepository.count({ email: payload.sub });
    if (count > 0) {
      throw new EmailAlreadyUsedException();
    }

    const user = new User();
    user.id = this.randomService.id();
    user.email = payload.sub;
    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    user.lastLoginAt = moment().unix();
    await this.userRepository.insert(user);

    const accessToken = this.tokenService.newAccessToken(user.id);
    const refreshToken = this.tokenService.newRefreshToken(user.id);
    return { accessToken, refreshToken };
  }

  async refresh(user: User) {
    const accessToken = this.tokenService.newAccessToken(user.id);
    const refreshToken = this.tokenService.newRefreshToken(user.id);
    return { accessToken, refreshToken };
  }
}
