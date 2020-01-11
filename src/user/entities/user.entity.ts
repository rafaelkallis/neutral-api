import { User } from 'user/user';
import { AbstractEntity, BigIntTransformer } from 'common';
import { Column, Entity } from 'typeorm';
import { IsEmail, MaxLength, IsString, IsNumber } from 'class-validator';

/**
 * User Entity
 */
@Entity('users')
export class UserEntity extends AbstractEntity implements User {
  @Column()
  @IsEmail()
  @MaxLength(100)
  public email: string;

  @Column({ name: 'first_name' })
  @IsString()
  @MaxLength(100)
  public firstName: string;

  @Column({ name: 'last_name' })
  @IsString()
  @MaxLength(100)
  public lastName: string;

  @Column({ name: 'last_login_at', transformer: new BigIntTransformer() })
  @IsNumber()
  public lastLoginAt: number;

  public static fromUser(user: User): UserEntity {
    const createdAt = Date.now();
    const updatedAt = Date.now();
    return new UserEntity(
      user.id,
      createdAt,
      updatedAt,
      user.email,
      user.firstName,
      user.lastName,
      user.lastLoginAt,
    );
  }

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    email: string,
    firstName: string,
    lastName: string,
    lastLoginAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.lastLoginAt = lastLoginAt;
  }
}
