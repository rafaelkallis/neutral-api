import { ApiModelProperty } from '@nestjs/swagger';
import { BaseDto } from 'common';
import { UserEntity } from 'user';
import { ProjectEntity, ContributionVisibility } from 'project';
import { RoleEntity, PeerReviewEntity } from 'role';
import { PeerReviewDto, PeerReviewDtoBuilder } from 'role/dto/peer-review.dto';

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
  public contribution: number | null;

  @ApiModelProperty({ required: false })
  public peerReviews: PeerReviewDto[] | null;

  public constructor(
    id: string,
    projectId: string,
    assigneeId: string | null,
    title: string,
    description: string,
    contribution: number | null,
    peerReviews: PeerReviewDto[] | null,
    createdAt: number,
    updatedAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.projectId = projectId;
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
    this.contribution = contribution;
    this.peerReviews = peerReviews;
  }
}

/**
 * Role DTO Builder
 */
export class RoleDtoBuilder {
  private readonly role: RoleEntity;
  private readonly project: ProjectEntity;
  private readonly authUser: UserEntity;

  public build(): RoleDto {
    const { role } = this;
    return new RoleDto(
      role.id,
      role.projectId,
      role.assigneeId,
      role.title,
      role.description,
      this.shouldExposeContribution() ? role.contribution : null,
      this.shouldExposePeerReviews()
        ? role.peerReviews
            .filter(pr => this.shouldExposePeerReview(pr))
            .map(pr => new PeerReviewDtoBuilder(pr).build())
        : null,
      role.createdAt,
      role.updatedAt,
    );
  }

  public constructor(
    role: RoleEntity,
    project: ProjectEntity,
    authUser: UserEntity,
  ) {
    this.role = role;
    this.project = project;
    this.authUser = authUser;
  }

  private shouldExposeContribution(): boolean {
    const { role, project, authUser } = this;
    if (project.isOwner(authUser)) {
      return true;
    }
    if (
      project.isFinishedState() &&
      project.contributionVisibility === ContributionVisibility.ALL
    ) {
      // FIXME: should not expose if authUser is not part of project
      return true;
    }
    if (
      project.isFinishedState() &&
      project.contributionVisibility === ContributionVisibility.SELF &&
      role.isAssignee(authUser)
    ) {
      return true;
    }
    return false;
  }

  private shouldExposePeerReviews(): boolean {
    const { role, project, authUser } = this;
    if (project.isOwner(authUser)) {
      return true;
    }
    if (role.isAssignee(authUser)) {
      return true;
    }
    return false;
  }

  private shouldExposePeerReview(peerReview: PeerReviewEntity): boolean {
    if (this.project.isOwner(this.authUser)) {
      return true;
    }
    if (
      peerReview.isReviewerRole(this.role) &&
      this.role.isAssignee(this.authUser)
    ) {
      return true;
    }
    return false;
  }
}
