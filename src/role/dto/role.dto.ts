import { ApiModelProperty } from '@nestjs/swagger';
import { BaseDto } from 'common';
import { UserEntity } from 'user';
import {
  ProjectEntity,
  ContributionVisibility,
  PeerReviewVisibility,
} from 'project';
import { RoleEntity } from 'role';
import { PeerReviewDto, PeerReviewDtoBuilder } from 'role/dto/peer-review.dto';
import { PeerReviewEntity } from 'role/entities/peer-review.entity';

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
  private getSentPeerReviews?: () => Promise<PeerReviewEntity[]>;
  private getReceivedPeerReviews?: () => Promise<PeerReviewEntity[]>;

  public addSentPeerReviews(
    getSentPeerReviews: () => Promise<PeerReviewEntity[]>,
  ): this {
    this.getSentPeerReviews = getSentPeerReviews;
    return this;
  }

  public addReceivedPeerReviews(
    getReceivedPeerReviews: () => Promise<PeerReviewEntity[]>,
  ): this {
    this.getReceivedPeerReviews = getReceivedPeerReviews;
    return this;
  }

  public async build(): Promise<RoleDto> {
    const { role, project, authUser } = this;
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
      const sentPeerReviews = await this.getSentPeerReviews();
      roleDto.sentPeerReviews = sentPeerReviews.map(pr =>
        new PeerReviewDtoBuilder(pr, role, project, authUser).build(),
      );
    }
    if (this.getReceivedPeerReviews && this.shouldExposeReceivedPeerReviews()) {
      const receivedPeerReviews = await this.getReceivedPeerReviews();
      roleDto.receivedPeerReviews = receivedPeerReviews.map(pr =>
        new PeerReviewDtoBuilder(pr, role, project, authUser).build(),
      );
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
    const { role, project, authUser } = this;
    if (project.isOwner(authUser)) {
      return true;
    }
    if (!project.isFinishedState()) {
      return false;
    }
    switch (project.peerReviewVisibility) {
      case PeerReviewVisibility.SENT_RECEIVED: {
        return role.isAssignee(authUser);
      }

      case PeerReviewVisibility.SENT_RECEIVEDSCORES: {
        return role.isAssignee(authUser);
      }

      case PeerReviewVisibility.SENT: {
        return false;
      }
    }
  }
}
