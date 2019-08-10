import { Entity, Column } from 'typeorm';
import { IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

import { BaseEntity } from './base.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ name: 'project_id' })
  @IsString()
  @MaxLength(20)
  @ApiModelProperty()
  projectId!: string;

  @Column({ name: 'assignee_id', type: 'varchar' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @ApiModelProperty({ required: false })
  assigneeId?: string | null;

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
}
