import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
} from 'class-validator';

import { Model } from 'common/domain/Model';
import { ProjectModel } from 'project/domain/ProjectModel';
import { UserModel } from 'user/domain/UserModel';
import { Id } from 'common/domain/value-objects/Id';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';

/**
 * Role Model
 */
export class RoleModel extends Model {
  public projectId: Id;

  public assigneeId: Id | null;

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
    id: Id,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    projectId: Id,
    assigneeId: Id | null,
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
