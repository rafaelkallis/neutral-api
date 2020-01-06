import { IsEmail, IsNumber, IsString, MaxLength } from 'class-validator';
import { MemoryEntity } from 'common';
import { UserEntity } from 'user/entities/user.entity';
import { User } from 'user/user';
import { MemoryUserRepository } from 'user/repositories/memory-user.repository';

/**
 * User Entity
 */
export class MemoryUserEntity extends MemoryEntity<User> implements UserEntity {
  @IsEmail()
  @MaxLength(100)
  public email: string;

  @IsString()
  @MaxLength(100)
  public firstName: string;

  @IsString()
  @MaxLength(100)
  public lastName: string;

  @IsNumber()
  public lastLoginAt: number;

  public constructor(
    userRepository: MemoryUserRepository,
    id: string,
    createdAt: number,
    updatedAt: number,
    email: string,
    firstName: string,
    lastName: string,
    lastLoginAt: number,
  ) {
    super(userRepository, id, createdAt, updatedAt);
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.lastLoginAt = lastLoginAt;
  }
}
