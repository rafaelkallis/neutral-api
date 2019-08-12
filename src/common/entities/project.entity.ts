import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

/**
 * Project Entity
 */
@Entity('projects')
export class Project extends BaseEntity {
  @Column({ name: 'title' })
  @IsString()
  @MaxLength(100)
  @ApiModelProperty()
  public title!: string;

  @Column({ name: 'description' })
  @IsString()
  @MaxLength(1024)
  @ApiModelProperty()
  public description!: string;

  @Column({ name: 'owner_id' })
  @IsString()
  @MaxLength(20)
  @ApiModelProperty()
  public ownerId!: string;
}
