import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'common';
import { UserModel } from 'user';
import { RoleDto } from 'role/dto/role.dto';
import {
  ProjectModel,
  ProjectState,
  ContributionVisibility,
  SkipManagerReview,
} from 'project/project.model';

/**
 * Project DTO
 */
export class ProjectDto extends BaseDto {
  @ApiProperty({
    example: 'Mars Shuttle',
    description: 'Title of the project',
  })
  public title: string;

  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the project',
  })
  public description: string;

  @ApiProperty()
  public creatorId: string;

  @ApiProperty()
  public state: ProjectState;

  @ApiProperty()
  public consensuality: number | null;

  @ApiProperty({ example: ContributionVisibility.SELF })
  public contributionVisibility: ContributionVisibility;

  @ApiProperty({ example: SkipManagerReview.IF_CONSENSUAL })
  public skipManagerReview: SkipManagerReview;

  @ApiProperty({ required: false })
  public roles?: RoleDto[];

  public static builder(): ProjectStep {
    return new ProjectStep();
  }

  public constructor(
    id: string,
    title: string,
    description: string,
    creatorId: string,
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
    this.creatorId = creatorId;
    this.state = state;
    this.consensuality = consensuality;
    this.contributionVisibility = contributionVisibility;
    this.skipManagerReview = skipManagerReview;
  }
}

class ProjectStep {
  project(project: ProjectModel): AuthUserStep {
    return new AuthUserStep(project);
  }
}

class AuthUserStep {
  private readonly projectEntity: ProjectModel;
  public constructor(projectEntity: ProjectModel) {
    this.projectEntity = projectEntity;
  }
  authUser(authUser: UserModel): BuildStep {
    return new BuildStep(this.projectEntity, authUser);
  }
}

class BuildStep {
  private readonly project: ProjectModel;
  private readonly authUser: UserModel;
  private roles?: RoleDto[];

  public constructor(project: ProjectModel, authUser: UserModel) {
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
      project.creatorId,
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
    return project.isCreator(authUser);
  }
}
