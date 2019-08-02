import { PrimaryColumn, Entity, Column } from 'typeorm';
import { IsString, IsEmail, MaxLength, IsNumber } from 'class-validator';
import { Exclude } from 'class-transformer';
import { ApiModelProperty } from '@nestjs/swagger';

import { BaseEntity } from './base.entity';
import { BigIntTransformer } from './bigint-transformer';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column()
  @IsEmail()
  @MaxLength(100)
  @ApiModelProperty()
  email: string;

  @Column({ name: 'first_name' })
  @IsString()
  @MaxLength(100)
  @ApiModelProperty()
  firstName: string;

  @Column({ name: 'last_name' })
  @IsString()
  @MaxLength(100)
  @ApiModelProperty()
  lastName: string;

  @Column({ name: 'last_login_at', transformer: new BigIntTransformer() })
  @IsNumber()
  @Exclude()
  lastLoginAt: number;
}
