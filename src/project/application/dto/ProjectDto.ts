import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'shared/application/dto/BaseDto';
import { User } from 'user/domain/User';
import { RoleDto } from 'project/application/dto/RoleDto';
import { Project } from 'project/domain/Project';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ProjectStateValue } from 'project/domain/value-objects/ProjectState';
import { ContributionVisibilityValue } from 'project/domain/value-objects/ContributionVisibility';
import { PeerReviewDto } from 'project/application/dto/PeerReviewDto';
import { PeerReview } from 'project/domain/PeerReview';

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

  @ApiProperty({ example: SkipManagerReview.IF_CONSENSUAL.value })
  public skipManagerReview: string;

  @ApiProperty({ required: false })
  public roles: RoleDto[] | null;

  @ApiProperty({ required: false })
  public peerReviews: PeerReviewDto[] | null;

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
    skipManagerReview: string,
    roles: RoleDto[] | null,
    peerReviews: PeerReviewDto[] | null,
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
    this.roles = roles;
    this.peerReviews = peerReviews;
  }
}

class ProjectStep {
  public project(project: Project): AuthUserStep {
    return new AuthUserStep(project);
  }
}

class AuthUserStep {
  private readonly projectEntity: Project;
  public constructor(projectEntity: Project) {
    this.projectEntity = projectEntity;
  }
  public authUser(authUser: User): BuildStep {
    return new BuildStep(this.projectEntity, authUser);
  }
}

class BuildStep {
  private readonly project: Project;
  private readonly authUser: User;

  public constructor(project: Project, authUser: User) {
    this.project = project;
    this.authUser = authUser;
  }

  public build(): ProjectDto {
    return new ProjectDto(
      this.project.id.value,
      this.project.title.value,
      this.project.description.value,
      this.project.creatorId.value,
      this.project.state.value,
      this.shouldExposeConsensuality()
        ? this.project.consensuality
          ? this.project.consensuality.value
          : null
        : null,
      this.project.contributionVisibility.value,
      this.project.skipManagerReview.value,
      this.createRoleDtos(),
      this.createPeerReviewDtos(),
      this.project.createdAt.value,
      this.project.updatedAt.value,
    );
  }

  private shouldExposeConsensuality(): boolean {
    const { project, authUser } = this;
    return project.isCreator(authUser);
  }

  private createRoleDtos(): RoleDto[] {
    const roles = Array.from(this.project.roles);
    return roles.map((role) =>
      RoleDto.builder()
        .role(role)
        .project(this.project)
        .authUser(this.authUser)
        .build(),
    );
  }

  private createPeerReviewDtos(): PeerReviewDto[] {
    const peerReviews = Array.from(this.project.peerReviews);
    return peerReviews
      .filter((peerReview) => this.shouldExposePeerReview(peerReview))
      .map((peerReview) =>
        PeerReviewDto.builder()
          .peerReview(peerReview)
          .project(this.project)
          .authUser(this.authUser)
          .build(),
      );
  }

  private shouldExposePeerReview(peerReview: PeerReview): boolean {
    const { project, authUser } = this;
    if (project.isCreator(authUser)) {
      return true;
    }
    if (project.roles.anyAssignedToUser(authUser)) {
      const authUserRole = project.roles.findByAssignee(authUser);
      if (peerReview.isSenderRole(authUserRole)) {
        return true;
      }
    }
    return false;
  }
}
