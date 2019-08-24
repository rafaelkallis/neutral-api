import { ApiModelProperty } from '@nestjs/swagger';
import {
  ProjectEntity,
  ProjectState,
  RelativeContributions,
} from '../../common';

/**
 * Project DTO
 */
export class ProjectDto {
  @ApiModelProperty()
  public id: string;

  @ApiModelProperty({
    example: 'Mars Shuttle',
    description: 'Title of the project',
  })
  public title: string;

  @ApiModelProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the project',
  })
  public description: string;

  @ApiModelProperty()
  public ownerId: string;

  @ApiModelProperty()
  public state: ProjectState;

  @ApiModelProperty()
  public relativeContributions: RelativeContributions | null;

  @ApiModelProperty()
  public createdAt: number;

  @ApiModelProperty()
  public updatedAt: number;

  public constructor(
    id: string,
    title: string,
    description: string,
    ownerId: string,
    state: ProjectState,
    relativeContributions: RelativeContributions | null,
    createdAt: number,
    updatedAt: number,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.ownerId = ownerId;
    this.state = state;
    this.relativeContributions = relativeContributions;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export class ProjectDtoBuilder {
  private readonly data: ProjectEntity;
  private _exposeRelativeContributions = false;

  public exposeRelativeContributions(value: boolean = true): this {
    this._exposeRelativeContributions = value;
    return this;
  }

  public build(): ProjectDto {
    return new ProjectDto(
      this.data.id,
      this.data.title,
      this.data.description,
      this.data.ownerId,
      this.data.state,
      this._exposeRelativeContributions
        ? this.data.relativeContributions
        : null,
      this.data.createdAt,
      this.data.updatedAt,
    );
  }

  public constructor(data: ProjectEntity) {
    this.data = data;
  }
}
