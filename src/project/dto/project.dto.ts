import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'common';
import { UserEntity } from 'user';
import { RoleDto } from 'role/dto/role.dto';
import {
  ProjectEntity,
  ProjectState,
  ContributionVisibility,
  PeerReviewVisibility,
  SkipManagerReview,
} from 'project/entities/project.entity';

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
  public ownerId: string;

  @ApiProperty()
  public state: ProjectState;

  @ApiProperty()
  public consensuality: number | null;

  @ApiProperty({ example: ContributionVisibility.SELF })
  public contributionVisibility: ContributionVisibility;

  @ApiProperty({ example: PeerReviewVisibility.SENT })
  public peerReviewVisibility: PeerReviewVisibility;

  @ApiProperty({ example: SkipManagerReview.IF_CONSENSUAL })
  public skipManagerReview: SkipManagerReview;

  @ApiProperty({ required: false })
  public roles?: RoleDto[];

  public constructor(
    id: string,
    title: string,
    description: string,
    ownerId: string,
    state: ProjectState,
    consensuality: number | null,
    contributionVisibility: ContributionVisibility,
    peerReviewVisibility: PeerReviewVisibility,
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
    this.peerReviewVisibility = peerReviewVisibility;
    this.skipManagerReview = skipManagerReview;
  }
}

interface ProjectStep {
  withProject(project: ProjectEntity): AuthUserStep;
}

interface AuthUserStep {
  withAuthUser(authUser: UserEntity): BuildStep;
}

interface BuildStep {
  build(): ProjectDto;
}

export class ProjectDtoBuilder implements ProjectStep, AuthUserStep, BuildStep {
  private project!: ProjectEntity;
  private authUser!: UserEntity;
  private roles?: RoleDto[];

  public static create(): ProjectStep {
    return new ProjectDtoBuilder();
  }

  private constructor() {}

  public withProject(project: ProjectEntity): AuthUserStep {
    this.project = project;
    return this;
  }

  public withAuthUser(authUser: UserEntity): BuildStep {
    this.authUser = authUser;
    return this;
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
      project.peerReviewVisibility,
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
