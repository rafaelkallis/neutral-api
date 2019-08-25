import { ApiModelProperty } from '@nestjs/swagger';
import { BaseDto, Role, PeerReviews } from '../../common';

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
  public peerReviews: PeerReviews | null;

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
    super(id, createdAt, updatedAt);
    this.projectId = projectId;
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
    this.peerReviews = peerReviews;
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
