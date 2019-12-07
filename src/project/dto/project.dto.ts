import { ApiModelProperty } from '@nestjs/swagger';
import {
  UserEntity,
  ProjectEntity,
  BaseDto,
  ProjectState,
  ContributionVisibility,
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
  public teamSpirit: number | null;

  @ApiModelProperty({ example: ContributionVisibility.SELF })
  public contributionVisibility: ContributionVisibility;

  public constructor(
    id: string,
    title: string,
    description: string,
    ownerId: string,
    state: ProjectState,
    teamSpirit: number | null,
    contributionVisibility: ContributionVisibility,
    createdAt: number,
    updatedAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.ownerId = ownerId;
    this.state = state;
    this.teamSpirit = teamSpirit;
    this.contributionVisibility = contributionVisibility;
  }
}

export class ProjectDtoBuilder {
  private readonly project: ProjectEntity;
  private readonly authUser: UserEntity;

  public constructor(project: ProjectEntity, authUser: UserEntity) {
    this.project = project;
    this.authUser = authUser;
  }

  public build(): ProjectDto {
    const { project } = this;
    return new ProjectDto(
      project.id,
      project.title,
      project.description,
      project.ownerId,
      project.state,
      this.shouldExposeConsensuality() ? project.consensuality : null,
      project.contributionVisibility,
      project.createdAt,
      project.updatedAt,
    );
  }

  private shouldExposeConsensuality(): boolean {
    const { project, authUser } = this;
    return project.isOwner(authUser);
  }
}
