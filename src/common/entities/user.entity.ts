import { IsEmail, IsNumber, IsString, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BigIntTransformer } from './bigint-transformer';

interface UserProps {
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

  public static from(props: UserProps): User {
    return Object.assign(new User(), props);
  }

  public update(props: Partial<UserProps>): User {
    return Object.assign(this, props);
  }
}
