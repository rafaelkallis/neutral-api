import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNumber, IsString, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';
import { BigIntTransformer } from './bigint-transformer';

interface UserOptions {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  lastLoginAt: number;
}

/**
 * User Entity
 */
@Entity('users')
export class User extends BaseEntity {
  @Column()
  @IsEmail()
  @MaxLength(100)
  @ApiModelProperty()
  public email!: string;

  @Column({ name: 'first_name' })
  @IsString()
  @MaxLength(100)
  @ApiModelProperty()
  public firstName!: string;

  @Column({ name: 'last_name' })
  @IsString()
  @MaxLength(100)
  @ApiModelProperty()
  public lastName!: string;

  @Column({ name: 'last_login_at', transformer: new BigIntTransformer() })
  @IsNumber()
  @Exclude()
  public lastLoginAt!: number;

  protected constructor() {
    super();
  }

  public static from({
    id,
    email,
    firstName,
    lastName,
    lastLoginAt,
  }: UserOptions): User {
    const user = new User();
    user.id = id;
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.lastLoginAt = lastLoginAt;
    return user;
  }
}
