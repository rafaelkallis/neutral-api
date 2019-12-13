import { Injectable } from '@nestjs/common';
import {
  ConfigService,
  EmailService,
  TokenAlreadyUsedException,
  TokenService,
} from 'common';
import { UserEntity } from 'user/entities/user.entity';
import { UserRepository } from 'user/repositories/user.repository';
import { UserDto, UserDtoBuilder } from 'user/dto/user.dto';
import { GetUsersQueryDto } from 'user/dto/get-users-query.dto';
import { UpdateUserDto } from 'user/dto/update-user.dto';

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
  public async getUsers(
    authUser: UserEntity,
    query: GetUsersQueryDto,
  ): Promise<UserDto[]> {
    let users: UserEntity[] = [];
    if (query.q) {
      users = await this.userRepository.findByName(query.q);
    } else {
      users = await this.userRepository.findPage(query);
    }
    return users.map(user => new UserDtoBuilder(user, authUser).build());
  }

  /**
   * Get the authenticated user
   */
  public async getAuthUser(authUser: UserEntity): Promise<UserDto> {
    return new UserDtoBuilder(authUser, authUser).build();
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
      const emailChangeMagicLink = `${this.configService.get(
        'FRONTEND_URL',
      )}/email_change/callback?token=${token}`;
      await this.emailService.sendEmailChangeEmail(email, emailChangeMagicLink);
    }
    authUser.update(otherChanges);
    await this.userRepository.update(authUser);
    return new UserDtoBuilder(authUser, authUser).build();
  }

  /**
   * Submit the email change token to verify a new email address
   */
  public async submitEmailChange(token: string): Promise<void> {
    const payload = this.tokenService.validateEmailChangeToken(token);
    const user = await this.userRepository.findOne({ id: payload.sub });
    if (user.email !== payload.curEmail) {
      throw new TokenAlreadyUsedException();
    }
    user.email = payload.newEmail;
    await this.userRepository.update(user);
  }

  /**
   * Get the user with the given id
   */
  public async getUser(authUser: UserEntity, id: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({ id });
    return new UserDtoBuilder(user, authUser).build();
  }

  /**
   * Delete the authenticated user
   */
  public async deleteAuthUser(authUser: UserEntity): Promise<void> {
    await this.userRepository.delete(authUser);
  }
}
