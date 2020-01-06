import { Injectable, Inject } from '@nestjs/common';
import { TokenAlreadyUsedException } from 'common';
import { UserEntity } from 'user/entities/user.entity';
import {
  UserRepository,
  USER_REPOSITORY,
} from 'user/repositories/user.repository';
import { UserDto } from 'user/dto/user.dto';
import { GetUsersQueryDto } from 'user/dto/get-users-query.dto';
import { UpdateUserDto } from 'user/dto/update-user.dto';
import { Config, CONFIG } from 'config';
import { EmailSender, EMAIL_SENDER } from 'email';
import { TOKEN_SERVICE, TokenService } from 'token';

@Injectable()
export class UserService {
  private readonly userRepository: UserRepository;
  private readonly config: Config;
  private readonly tokenService: TokenService;
  private readonly emailSender: EmailSender;

  public constructor(
    @Inject(CONFIG) config: Config,
    @Inject(USER_REPOSITORY) userRepository: UserRepository,
    @Inject(TOKEN_SERVICE) tokenService: TokenService,
    @Inject(EMAIL_SENDER) emailSender: EmailSender,
  ) {
    this.config = config;
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.emailSender = emailSender;
  }

  /**
   * Get users
   */
  public async getUsers(
    authUser: UserEntity,
    query: GetUsersQueryDto,
  ): Promise<UserDto[]> {
    let users: UserEntity[] = [];
    if (query.q) {
      users = await this.userRepository.findByName(query.q);
    } else if (query.after) {
      users = await this.userRepository.findPage(query.after);
    } else {
      users = await this.userRepository.findPage();
    }
    return users.map(user =>
      UserDto.builder()
        .user(user)
        .authUser(authUser)
        .build(),
    );
  }

  /**
   * Get the authenticated user
   */
  public async getAuthUser(authUser: UserEntity): Promise<UserDto> {
    return UserDto.builder()
      .user(authUser)
      .authUser(authUser)
      .build();
  }

  /**
   * Update the authenticated user
   *
   * If the email address is changed, a email change magic link is sent
   * to verify the new email address.
   */
  public async updateUser(
    authUser: UserEntity,
    dto: UpdateUserDto,
  ): Promise<UserDto> {
    const { email, ...otherChanges } = dto;
    if (email) {
      const token = this.tokenService.newEmailChangeToken(
        authUser.id,
        authUser.email,
        email,
      );
      const emailChangeMagicLink = `${this.config.get(
        'FRONTEND_URL',
      )}/email_change/callback?token=${token}`;
      await this.emailSender.sendEmailChangeEmail(email, emailChangeMagicLink);
    }
    Object.assign(authUser, otherChanges);
    await authUser.persist();
    return UserDto.builder()
      .user(authUser)
      .authUser(authUser)
      .build();
  }

  /**
   * Submit the email change token to verify a new email address
   */
  public async submitEmailChange(token: string): Promise<void> {
    const payload = this.tokenService.validateEmailChangeToken(token);
    const user = await this.userRepository.findOne(payload.sub);
    if (user.email !== payload.curEmail) {
      throw new TokenAlreadyUsedException();
    }
    user.email = payload.newEmail;
    await user.persist();
  }

  /**
   * Get the user with the given id
   */
  public async getUser(authUser: UserEntity, id: string): Promise<UserDto> {
    const user = await this.userRepository.findOne(id);
    return UserDto.builder()
      .user(user)
      .authUser(authUser)
      .build();
  }

  /**
   * Delete the authenticated user
   */
  public async deleteAuthUser(authUser: UserEntity): Promise<void> {
    await this.userRepository.delete(authUser);
  }
}
