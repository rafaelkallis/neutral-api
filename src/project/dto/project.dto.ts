import { ApiModelProperty } from '@nestjs/swagger';
import {
  ProjectEntity,
  BaseDto,
  ProjectState,
  Contributions,
} from '../../common';

/**
 * Project DTO
 */
export class ProjectDto extends BaseDto {
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
  public contributions: Contributions | null;

  public constructor(
    id: string,
    title: string,
    description: string,
    ownerId: string,
    state: ProjectState,
    contributions: Contributions | null,
    createdAt: number,
    updatedAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.ownerId = ownerId;
    this.state = state;
    this.contributions = contributions;
  }
}

export class ProjectDtoBuilder {
  private readonly data: ProjectEntity;
  private _exposeContributions = false;

  public exposeContributions(value: boolean = true): this {
    this._exposeContributions = value;
    return this;
  }

  public build(): ProjectDto {
    return new ProjectDto(
      this.data.id,
      this.data.title,
      this.data.description,
      this.data.ownerId,
      this.data.state,
      this._exposeContributions ? this.data.contributions : null,
      this.data.createdAt,
      this.data.updatedAt,
    );
  }

  public constructor(data: ProjectEntity) {
    this.data = data;
  }
}
