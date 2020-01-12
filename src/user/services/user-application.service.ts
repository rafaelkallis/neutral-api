import { Injectable, Inject } from '@nestjs/common';
import { UserEntity } from 'user/entities/user.entity';
import {
  UserRepository,
  USER_REPOSITORY,
} from 'user/repositories/user.repository';
import { UserDto } from 'user/dto/user.dto';
import { GetUsersQueryDto } from 'user/dto/get-users-query.dto';
import { UpdateUserDto } from 'user/dto/update-user.dto';
import { UserDomainService } from 'user/services/user-domain.service';

@Injectable()
export class UserApplicationService {
  private readonly userRepository: UserRepository;
  private readonly userDomainService: UserDomainService;

  public constructor(
    @Inject(USER_REPOSITORY) userRepository: UserRepository,
    userDomainService: UserDomainService,
  ) {
    this.userRepository = userRepository;
    this.userDomainService = userDomainService;
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
   * Get the user with the given id
   */
  public async getUser(authUser: UserEntity, id: string): Promise<UserDto> {
    const user = await this.userRepository.findById(id);
    return UserDto.builder()
      .user(user)
      .authUser(authUser)
      .build();
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
  public async updateAuthUser(
    authUser: UserEntity,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    await this.userDomainService.updateUser(authUser, updateUserDto);
    return UserDto.builder()
      .user(authUser)
      .authUser(authUser)
      .build();
  }

  /**
   * Submit the email change token to verify a new email address
   */
  public async submitEmailChange(token: string): Promise<void> {
    await this.userDomainService.submitEmailChange(token);
  }

  /**
   * Delete the authenticated user
   */
  public async deleteAuthUser(authUser: UserEntity): Promise<void> {
    await this.userDomainService.deleteUser(authUser);
  }
}
