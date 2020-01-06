import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { Column, Entity } from 'typeorm';

import { TypeOrmEntity } from 'common';
import { UserEntity } from 'user';
import { Role } from 'role/role';
import { RoleEntity } from 'role';
import { TypeOrmRoleRepository } from 'role/repositories/typeorm-role.repository';
import { User } from 'user/user';

/**
 * Role Entity
 */
@Entity('roles')
export class TypeOrmRoleEntity extends TypeOrmEntity<Role>
  implements RoleEntity {
  @Column({ name: 'project_id' })
  @IsString()
  @MaxLength(24)
  public projectId: string;

  @Column({ name: 'assignee_id', type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(24)
  public assigneeId: string | null;

  @Column({ name: 'title' })
  @IsString()
  @MaxLength(100)
  public title: string;

  @Column({ name: 'description' })
  @IsString()
  @MaxLength(1024)
  public description: string;

  @Column({ name: 'contribution', type: 'real', nullable: true })
  @IsNumber()
  @IsOptional()
  public contribution: number | null;

  @Column({ name: 'has_submitted_peer_reviews' })
  @IsBoolean()
  public hasSubmittedPeerReviews: boolean;

  public constructor(
    typeOrmRoleRepository: TypeOrmRoleRepository,
    id: string,
    createdAt: number,
    updatedAt: number,
    projectId: string,
    assigneeId: string | null,
    title: string,
    description: string,
    contribution: number | null,
    hasSubmittedPeerReviews: boolean,
  ) {
    super(typeOrmRoleRepository, id, createdAt, updatedAt);
    this.projectId = projectId;
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
    this.contribution = contribution;
    this.hasSubmittedPeerReviews = hasSubmittedPeerReviews;
  }

  public hasAssignee(): boolean {
    return Boolean(this.assigneeId);
  }

  public isAssignee(user: User): boolean {
    return this.assigneeId === user.id;
  }
}
