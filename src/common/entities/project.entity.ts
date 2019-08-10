import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity('projects')
export class Project extends BaseEntity {
  @Column({ name: 'title' })
  @IsString()
  @MaxLength(100)
  @ApiModelProperty()
  title!: string;

  @Column({ name: 'description' })
  @IsString()
  @MaxLength(1024)
  @ApiModelProperty()
  description!: string;

  @Column({ name: 'owner_id' })
  @IsString()
  @MaxLength(20)
  @ApiModelProperty()
  ownerId!: string;
}
