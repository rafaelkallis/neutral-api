import { ApiModelProperty } from '@nestjs/swagger';
import { BaseDto, RoleEntity } from '../../common';

/**
 * Role DTO
 */
export class RoleDto extends BaseDto {
  @ApiModelProperty()
  public projectId: string;

  @ApiModelProperty({ required: false })
  public assigneeId: string | null;

  @ApiModelProperty()
  public title: string;

  @ApiModelProperty()
  public description: string;

  @ApiModelProperty({ required: false })
  public contribution: number | null;

  @ApiModelProperty({ required: false })
  public peerReviews: [string, number][] | null;

  public constructor(
    id: string,
    projectId: string,
    assigneeId: string | null,
    title: string,
    description: string,
    contribution: number | null,
    peerReviews: [string, number][] | null,
    createdAt: number,
    updatedAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.projectId = projectId;
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
    this.contribution = contribution;
    this.peerReviews = peerReviews;
  }
}

/**
 * Role DTO Builder
 */
export class RoleDtoBuilder {
  private readonly data: RoleEntity;
  private _exposePeerReviews = false;
  private _exposeContribution = false;

  public exposeContribution(value: boolean = true): this {
    this._exposeContribution = value;
    return this;
  }

  public exposePeerReviews(value: boolean = true): this {
    this._exposePeerReviews = value;
    return this;
  }

  public build(): RoleDto {
    return new RoleDto(
      this.data.id,
      this.data.projectId,
      this.data.assigneeId,
      this.data.title,
      this.data.description,
      this._exposeContribution ? this.data.contribution : null,
      this._exposePeerReviews
        ? this.data.peerReviews.map(pr => [pr.revieweeRoleId, pr.score])
        : null,
      this.data.createdAt,
      this.data.updatedAt,
    );
  }

  public constructor(data: RoleEntity) {
    this.data = data;
  }
}
