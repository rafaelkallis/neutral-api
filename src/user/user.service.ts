import { Injectable } from '@nestjs/common';
import {
  ConfigService,
  EmailService,
  TokenAlreadyUsedException,
  TokenService,
  User,
  UserRepository,
} from '../common';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly userRepository: UserRepository;
  private readonly configService: ConfigService;
  private readonly tokenService: TokenService;
  private readonly emailService: EmailService;

  public constructor(
    userRepository: UserRepository,
    configService: ConfigService,
    tokenService: TokenService,
    emailService: EmailService,
  ) {
    this.userRepository = userRepository;
    this.configService = configService;
    this.tokenService = tokenService;
    this.emailService = emailService;
  }

  /**
   * Get users
   */
  public async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Get the authenticated user
   */
  public async getAuthUser(authUser: User): Promise<User> {
    return authUser;
  }

  /**
   * Update the authenticated user
   *
   * If the email address is changed, a email change magic link is sent
   * to verify the new email address.
   */
  public async updateUser(authUser: User, dto: UpdateUserDto): Promise<User> {
    const { email, ...otherChanges } = dto;
    if (email) {
      const token = this.tokenService.newEmailChangeToken(
        authUser.id,
        authUser.email,
        email,
      );
      const emailChangeMagicLink = `${this.configService.get(
        'FRONTEND_URL',
      )}/email_change/callback?token=${token}`;
      await this.emailService.sendEmailChangeEmail(email, emailChangeMagicLink);
    }
    authUser.update(otherChanges);
    return this.userRepository.save(authUser);
  }

  /**
   * Submit the email change token to verify a new email address
   */
  public async submitEmailChange(token: string): Promise<void> {
    const payload = this.tokenService.validateEmailChangeToken(token);
    const user = await this.userRepository.findOneOrFail({ id: payload.sub });
    if (user.email !== payload.curEmail) {
      throw new TokenAlreadyUsedException();
    }
    user.email = payload.newEmail;
    await this.userRepository.save(user);
  }

  /**
   * Get the user with the given id
   */
  public async getUser(id: string): Promise<User> {
    return this.userRepository.findOneOrFail({ id });
  }

  /**
   * Delete the authenticated user
   */
  public async deleteAuthUser(authUser: User): Promise<void> {
    await this.userRepository.remove(authUser);
  }
}
