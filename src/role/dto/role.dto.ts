import { ApiModelProperty } from '@nestjs/swagger';
import { BaseDto } from 'common';
import { UserEntity } from 'user';
import { ProjectEntity, ContributionVisibility } from 'project';
import { RoleEntity } from 'role';
import { PeerReviewDto } from 'role/dto/peer-review.dto';

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
  public sentPeerReviews?: PeerReviewDto[];

  @ApiModelProperty({ required: false })
  public receivedPeerReviews?: PeerReviewDto[];

  public constructor(
    id: string,
    projectId: string,
    assigneeId: string | null,
    title: string,
    description: string,
    contribution: number | null,
    createdAt: number,
    updatedAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.projectId = projectId;
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
    this.contribution = contribution;
  }
}

/**
 * Role DTO Builder
 */
export class RoleDtoBuilder {
  private readonly role: RoleEntity;
  private readonly project: ProjectEntity;
  private readonly projectRoles: RoleEntity[];
  private readonly authUser: UserEntity;
  private getSentPeerReviews?: () => Promise<PeerReviewDto[]>;
  private getReceivedPeerReviews?: () => Promise<PeerReviewDto[]>;

  public addSentPeerReviews(
    getSentPeerReviews: () => Promise<PeerReviewDto[]>,
  ): this {
    this.getSentPeerReviews = getSentPeerReviews;
    return this;
  }

  public addReceivedPeerReviews(
    getReceivedPeerReviews: () => Promise<PeerReviewDto[]>,
  ): this {
    this.getReceivedPeerReviews = getReceivedPeerReviews;
    return this;
  }

  public async build(): Promise<RoleDto> {
    const { role } = this;
    const roleDto = new RoleDto(
      role.id,
      role.projectId,
      role.assigneeId,
      role.title,
      role.description,
      this.shouldExposeContribution() ? role.contribution : null,
      role.createdAt,
      role.updatedAt,
    );
    if (this.getSentPeerReviews && this.shouldExposeSentPeerReviews()) {
      roleDto.sentPeerReviews = await this.getSentPeerReviews();
    }
    if (this.getReceivedPeerReviews && this.shouldExposeReceivedPeerReviews()) {
      roleDto.receivedPeerReviews = await this.getReceivedPeerReviews();
    }
    return roleDto;
  }

  public constructor(
    role: RoleEntity,
    project: ProjectEntity,
    projectRoles: RoleEntity[],
    authUser: UserEntity,
  ) {
    this.role = role;
    this.project = project;
    this.projectRoles = projectRoles;
    this.authUser = authUser;
  }

  private shouldExposeContribution(): boolean {
    const { role, project, projectRoles, authUser } = this;
    switch (project.contributionVisibility) {
      case ContributionVisibility.PUBLIC: {
        return project.isFinishedState();
      }

      case ContributionVisibility.PROJECT: {
        if (project.isOwner(authUser)) {
          return true;
        }
        if (!project.isFinishedState()) {
          return false;
        }
        return projectRoles.some(r => r.isAssignee(authUser));
      }

      case ContributionVisibility.SELF: {
        if (project.isOwner(authUser)) {
          return true;
        }
        if (!project.isFinishedState()) {
          return false;
        }
        return role.isAssignee(authUser);
      }

      case ContributionVisibility.NONE: {
        return project.isOwner(authUser);
      }
    }
  }

  private shouldExposeSentPeerReviews(): boolean {
    const { role, project, authUser } = this;
    if (project.isOwner(authUser)) {
      return true;
    }
    if (role.isAssignee(authUser)) {
      return true;
    }
    return false;
  }

  private shouldExposeReceivedPeerReviews(): boolean {
    const { project, authUser } = this;
    if (project.isOwner(authUser)) {
      return true;
    }
    // TODO allow is peer review visibility option allows
    return false;
  }
}
