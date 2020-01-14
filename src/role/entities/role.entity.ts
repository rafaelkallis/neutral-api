import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { Column, Entity } from 'typeorm';

import { AbstractEntity } from 'common';
import { Role } from 'role/role';
import { User } from 'user';
import { Project } from 'project';

/**
 * Role Entity
 */
@Entity('roles')
export class RoleEntity extends AbstractEntity implements Role {
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
    super(id, createdAt, updatedAt);
    this.projectId = projectId;
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
    this.contribution = contribution;
    this.hasSubmittedPeerReviews = hasSubmittedPeerReviews;
  }

  /**
   *
   */
  public static fromRole(role: Role): RoleEntity {
    const createdAt = Date.now();
    const updatedAt = Date.now();
    return new RoleEntity(
      role.id,
      createdAt,
      updatedAt,
      role.projectId,
      role.assigneeId,
      role.title,
      role.description,
      role.contribution,
      role.hasSubmittedPeerReviews,
    );
  }

  public hasAssignee(): boolean {
    return Boolean(this.assigneeId);
  }

  public isAssignee(user: User): boolean {
    return this.assigneeId === user.id;
  }

  public belongsToProject(project: Project): boolean {
    return this.projectId === project.id;
  }
}
