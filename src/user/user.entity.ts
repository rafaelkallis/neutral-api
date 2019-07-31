import { BaseEntity, BigIntTransformer } from '../common';
import { PrimaryColumn, Entity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { IsString, IsEmail, MaxLength, IsNumber } from 'class-validator';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @Column({ name: 'first_name' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @Column({ name: 'last_name' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @Column({ name: 'last_login_at', transformer: new BigIntTransformer() })
  @IsNumber()
  lastLoginAt: number;
}
