import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNumber, IsString, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';
import { BigIntTransformer } from './bigint-transformer';

/**
 * User Entity
 */
@Entity('users')
export class User extends BaseEntity {
  @Column()
  @IsEmail()
  @MaxLength(100)
  @ApiModelProperty()
  email!: string;

  @Column({ name: 'first_name' })
  @IsString()
  @MaxLength(100)
  @ApiModelProperty()
  firstName!: string;

  @Column({ name: 'last_name' })
  @IsString()
  @MaxLength(100)
  @ApiModelProperty()
  lastName!: string;

  @Column({ name: 'last_login_at', transformer: new BigIntTransformer() })
  @IsNumber()
  @Exclude()
  lastLoginAt!: number;
}
