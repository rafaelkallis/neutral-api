import { ApiModelProperty } from '@nestjs/swagger';
import { Role, PeerReviews } from '../../common';

/**
 * Role DTO
 */
export class RoleDto {
  @ApiModelProperty()
  public id: string;

  @ApiModelProperty()
  public projectId: string;

  @ApiModelProperty({ required: false })
  public assigneeId: string | null;

  @ApiModelProperty()
  public title: string;

  @ApiModelProperty()
  public description: string;

  @ApiModelProperty({ required: false })
  public peerReviews: PeerReviews | null;

  @ApiModelProperty()
  public createdAt: number;

  @ApiModelProperty()
  public updatedAt: number;

  public constructor(
    id: string,
    projectId: string,
    assigneeId: string | null,
    title: string,
    description: string,
    peerReviews: PeerReviews | null,
    createdAt: number,
    updatedAt: number,
  ) {
    this.id = id;
    this.projectId = projectId;
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
    this.peerReviews = peerReviews;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

/**
 * Role DTO Builder
 */
export class RoleDtoBuilder {
  private readonly data: Role;
  private _exposePeerReviews = false;

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
      this._exposePeerReviews ? this.data.peerReviews : null,
      this.data.createdAt,
      this.data.updatedAt,
    );
  }

  public constructor(data: Role) {
    this.data = data;
  }
}
