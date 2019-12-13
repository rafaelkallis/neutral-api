import { ApiModelProperty } from '@nestjs/swagger';
import { BaseDto } from 'common';
import { UserEntity } from 'user';
import { RoleEntity } from 'role';
import { RoleDto } from 'role/dto/role.dto';
import {
  ProjectEntity,
  ProjectState,
  ContributionVisibility,
  SkipManagerReview,
} from 'project/entities/project.entity';

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
  public consensuality: number | null;

  @ApiModelProperty({ example: ContributionVisibility.SELF })
  public contributionVisibility: ContributionVisibility;

  @ApiModelProperty({ example: SkipManagerReview.IF_CONSENSUAL })
  public skipManagerReview: SkipManagerReview;

  @ApiModelProperty({ required: false })
  public roles?: RoleDto[];

  public constructor(
    id: string,
    title: string,
    description: string,
    ownerId: string,
    state: ProjectState,
    consensuality: number | null,
    contributionVisibility: ContributionVisibility,
    skipManagerReview: SkipManagerReview,
    createdAt: number,
    updatedAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.ownerId = ownerId;
    this.state = state;
    this.consensuality = consensuality;
    this.contributionVisibility = contributionVisibility;
    this.skipManagerReview = skipManagerReview;
  }
}

export class ProjectDtoBuilder {
  private readonly project: ProjectEntity;
  private readonly authUser: UserEntity;
  private roles?: RoleDto[];

  public constructor(project: ProjectEntity, authUser: UserEntity) {
    this.project = project;
    this.authUser = authUser;
  }

  public addRoles(roles: RoleDto[]): this {
    this.roles = roles;
    return this;
  }

  public build(): ProjectDto {
    const { project, roles } = this;
    const projectDto = new ProjectDto(
      project.id,
      project.title,
      project.description,
      project.ownerId,
      project.state,
      this.shouldExposeConsensuality() ? project.consensuality : null,
      project.contributionVisibility,
      project.skipManagerReview,
      project.createdAt,
      project.updatedAt,
    );
    if (roles) {
      projectDto.roles = roles;
    }
    return projectDto;
  }

  private shouldExposeConsensuality(): boolean {
    const { project, authUser } = this;
    return project.isOwner(authUser);
  }
}
