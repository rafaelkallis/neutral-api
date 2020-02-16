import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'common';
import { UserModel } from 'user';
import { RoleDto } from 'project/application/dto/RoleDto';
import { ProjectModel } from 'project/domain/ProjectModel';
import { SkipManagerReviewValue } from 'project/domain/value-objects/SkipManagerReview';
import { ProjectStateValue } from 'project/domain/value-objects/ProjectState';
import { ContributionVisibilityValue } from 'project/domain/value-objects/ContributionVisibility';

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

  @ApiProperty({ example: ProjectStateValue.FORMATION })
  public state: ProjectStateValue;

  @ApiProperty()
  public consensuality: number | null;

  @ApiProperty({ example: ContributionVisibilityValue.SELF })
  public contributionVisibility: ContributionVisibilityValue;

  @ApiProperty({ example: SkipManagerReviewValue.IF_CONSENSUAL })
  public skipManagerReview: SkipManagerReviewValue;

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
    state: ProjectStateValue,
    consensuality: number | null,
    contributionVisibility: ContributionVisibilityValue,
    skipManagerReview: SkipManagerReviewValue,
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
      project.id.value,
      project.title.value,
      project.description.value,
      project.creatorId.value,
      project.state.toValue(),
      this.shouldExposeConsensuality()
        ? project.consensuality
          ? project.consensuality.value
          : null
        : null,
      project.contributionVisibility.toValue(),
      project.skipManagerReview.toValue(),
      project.createdAt.value,
      project.updatedAt.value,
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
