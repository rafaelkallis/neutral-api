import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'common';
import { UserEntity } from 'user';
import { ProjectEntity, ContributionVisibility } from 'project';
import { RoleEntity } from 'role';
import { PeerReviewDto, PeerReviewDtoBuilder } from 'role/dto/peer-review.dto';
import { PeerReviewEntity } from 'role/entities/peer-review.entity';

/**
 * Role DTO
 */
export class RoleDto extends BaseDto {
  @ApiProperty()
  public projectId: string;

  @ApiProperty({ required: false })
  public assigneeId: string | null;

  @ApiProperty()
  public title: string;

  @ApiProperty()
  public description: string;

  @ApiProperty({ required: false })
  public contribution: number | null;

  @ApiProperty({ required: false })
  public sentPeerReviews?: PeerReviewDto[];

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

interface RoleStep {
  withRole(role: RoleEntity): ProjectStep;
}

interface ProjectStep {
  withProject(project: ProjectEntity): ProjectRolesStep;
}

interface ProjectRolesStep {
  withProjectRoles(projectRoles: RoleEntity[]): AuthUserStep;
}

interface AuthUserStep {
  withAuthUser(authUser: UserEntity): BuildStep;
}

interface BuildStep {
  build(): Promise<RoleDto>;
  addSentPeerReviews(
    getSentPeerReviews: () => Promise<PeerReviewEntity[]>,
  ): BuildStep;
}

/**
 * Role DTO Builder
 */
export class RoleDtoBuilder
  implements ProjectStep, ProjectRolesStep, AuthUserStep, BuildStep {
  private role: RoleEntity;
  private project!: ProjectEntity;
  private projectRoles!: RoleEntity[];
  private authUser!: UserEntity;
  private getSentPeerReviews?: () => Promise<PeerReviewEntity[]>;

  private constructor(role: RoleEntity) {
    this.role = role;
  }

  public static of(role: RoleEntity): ProjectStep {
    return new RoleDtoBuilder(role);
  }

  public withRole(role: RoleEntity): ProjectStep {
    this.role = role;
    return this;
  }

  public withProject(project: ProjectEntity): ProjectRolesStep {
    this.project = project;
    return this;
  }

  public withProjectRoles(projectRoles: RoleEntity[]): AuthUserStep {
    this.projectRoles = projectRoles;
    return this;
  }

  public withAuthUser(authUser: UserEntity): BuildStep {
    this.authUser = authUser;
    return this;
  }

  public addSentPeerReviews(
    getSentPeerReviews: () => Promise<PeerReviewEntity[]>,
  ): BuildStep {
    this.getSentPeerReviews = getSentPeerReviews;
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
      const sentPeerReviews = await this.getSentPeerReviews();
      roleDto.sentPeerReviews = sentPeerReviews.map(pr =>
        PeerReviewDtoBuilder.of(pr).build(),
      );
    }
    return roleDto;
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
}
