import { BaseEntity } from '../common';
import { PrimaryColumn, Entity, Column } from 'typeorm';
import { IsString, IsEmail, MaxLength, IsNumber } from 'class-validator';

@Entity({ name: 'projects' })
export class Project extends BaseEntity {
  @Column({ name: 'title' })
  @IsString()
  @MaxLength(100)
  title: string;

  @Column({ name: 'description' })
  @IsString()
  @MaxLength(1024)
  description: string;

  @Column({ name: 'owner_id' })
  @IsString()
  @MaxLength(20)
  ownerId: string;
}
