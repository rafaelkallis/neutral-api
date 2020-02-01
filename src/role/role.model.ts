import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
} from 'class-validator';

import { AbstractModel } from 'common';
import { ProjectModel } from 'project';
import { UserModel } from 'user';

/**
 * Role Model
 */
export class RoleModel extends AbstractModel {
  @IsString()
  @MaxLength(24)
  public projectId: string;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  public assigneeId: string | null;

  @IsString()
  @MaxLength(100)
  public title: string;

  @IsString()
  @MaxLength(1024)
  public description: string;

  @IsNumber()
  @IsOptional()
  public contribution: number | null;

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

  public hasAssignee(): boolean {
    return Boolean(this.assigneeId);
  }

  public isAssignee(user: UserModel): boolean {
    return this.assigneeId === user.id;
  }

  public belongsToProject(project: ProjectModel): boolean {
    return this.projectId === project.id;
  }
}
