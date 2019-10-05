import { IsEmail, IsNumber, IsString, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BigIntTransformer } from './bigint-transformer';

interface UserEntityOptions {
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
export class UserEntity extends BaseEntity implements UserEntityOptions {
  @Column()
  @IsEmail()
  @MaxLength(100)
  public email!: string;

  @Column({ name: 'first_name' })
  @IsString()
  @MaxLength(100)
  public firstName!: string;

  @Column({ name: 'last_name' })
  @IsString()
  @MaxLength(100)
  public lastName!: string;

  @Column({ name: 'last_login_at', transformer: new BigIntTransformer() })
  @IsNumber()
  public lastLoginAt!: number;

  public static from(options: UserEntityOptions): UserEntity {
    return Object.assign(new UserEntity(), options);
  }

  public update(options: Partial<UserEntityOptions>): this {
    return Object.assign(this, options);
  }
}
