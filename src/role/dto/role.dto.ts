import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'common';
import { UserEntity } from 'user';
import { ProjectEntity, ContributionVisibility } from 'project';
import { RoleEntity } from 'role';
import { PeerReviewDto, PeerReviewDtoBuilder } from 'role/dto/peer-review.dto';
import { PeerReviewEntity } from 'role/entities/peer-review.entity';
import { InternalServerErrorException } from '@nestjs/common';

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

  @ApiProperty({
    required: false,
    description:
      'The submitted peer reviews of the role assignee. Only visible to the project manager and the role assignee.',
  })
  public submittedPeerReviews: PeerReviewDto[] | null;

  @ApiProperty({
    required: false,
    description:
      'Specifies whether or not the assigned user has submitted peer reviews. Only visible to the project manager and the assignee.',
  })
  public hasSubmittedPeerReviews: boolean | null;

  public constructor(
    id: string,
    projectId: string,
    assigneeId: string | null,
    title: string,
    description: string,
    contribution: number | null,
    submittedPeerReviews: PeerReviewDto[] | null,
    hasSubmittedPeerReviews: boolean | null,
    createdAt: number,
    updatedAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.projectId = projectId;
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
    this.contribution = contribution;
    this.submittedPeerReviews = submittedPeerReviews;
    this.hasSubmittedPeerReviews = hasSubmittedPeerReviews;
  }

  public static builder(): RoleStep {
    return new RoleDtoBuilder();
  }
}

interface RoleStep {
  role(role: RoleEntity): ProjectStep;
}

interface ProjectStep {
  project(project: ProjectEntity): ProjectRolesStep;
}

interface ProjectRolesStep {
  projectRoles(projectRoles: RoleEntity[]): AuthUserStep;
}

interface AuthUserStep {
  authUser(authUser: UserEntity): BuildStep;
}

interface BuildStep {
  build(): Promise<RoleDto>;
  addSubmittedPeerReviews(
    getSubmittedPeerReviews: () => Promise<PeerReviewEntity[]>,
  ): BuildStep;
}

/**
 * Role DTO Builder
 */
class RoleDtoBuilder
  implements RoleStep, ProjectStep, ProjectRolesStep, AuthUserStep, BuildStep {
  private _role!: RoleEntity;
  private _project!: ProjectEntity;
  private _projectRoles!: RoleEntity[];
  private _authUser!: UserEntity;
  private _getSubmittedPeerReviews?: () => Promise<PeerReviewEntity[]>;

  public role(role: RoleEntity): ProjectStep {
    this._role = role;
    return this;
  }

  public project(project: ProjectEntity): ProjectRolesStep {
    this._project = project;
    return this;
  }

  public projectRoles(projectRoles: RoleEntity[]): AuthUserStep {
    this._projectRoles = projectRoles;
    return this;
  }

  public authUser(authUser: UserEntity): BuildStep {
    this._authUser = authUser;
    return this;
  }

  public addSubmittedPeerReviews(
    getSentPeerReviews: () => Promise<PeerReviewEntity[]>,
  ): BuildStep {
    this._getSubmittedPeerReviews = getSentPeerReviews;
    return this;
  }

  public async build(): Promise<RoleDto> {
    const { _role: role } = this;
    const roleDto = new RoleDto(
      role.id,
      role.projectId,
      role.assigneeId,
      role.title,
      role.description,
      this.shouldExposeContribution() ? role.contribution : null,
      null,
      this.shouldExposeHasSubmittedPeerReviews()
        ? role.hasSubmittedPeerReviews
        : null,
      role.createdAt,
      role.updatedAt,
    );
    if (
      this._getSubmittedPeerReviews &&
      this.shouldExposeSubmittedPeerReviews()
    ) {
      const submittedPeerReviews = await this._getSubmittedPeerReviews();
      roleDto.submittedPeerReviews = submittedPeerReviews.map(pr =>
        PeerReviewDtoBuilder.of(pr).build(),
      );
    }
    return roleDto;
  }

  private shouldExposeContribution(): boolean {
    const {
      _role: role,
      _project: project,
      _projectRoles: projectRoles,
      _authUser: authUser,
    } = this;
    switch (project.contributionVisibility) {
      case ContributionVisibility.PUBLIC: {
        return project.isFinishedState();
      }

      case ContributionVisibility.PROJECT: {
        if (project.isCreator(authUser)) {
          return true;
        }
        if (!project.isFinishedState()) {
          return false;
        }
        return projectRoles.some(r => r.isAssignee(authUser));
      }

      case ContributionVisibility.SELF: {
        if (project.isCreator(authUser)) {
          return true;
        }
        if (!project.isFinishedState()) {
          return false;
        }
        return role.isAssignee(authUser);
      }

      case ContributionVisibility.NONE: {
        return project.isCreator(authUser);
      }

      default: {
        throw new InternalServerErrorException();
      }
    }
  }

  private shouldExposeHasSubmittedPeerReviews(): boolean {
    const { _role: role, _project: project, _authUser: authUser } = this;
    if (project.isCreator(authUser)) {
      return true;
    }
    if (role.isAssignee(authUser)) {
      return true;
    }
    return false;
  }

  private shouldExposeSubmittedPeerReviews(): boolean {
    const { _role: role, _project: project, _authUser: authUser } = this;
    if (project.isCreator(authUser)) {
      return true;
    }
    if (role.isAssignee(authUser)) {
      return true;
    }
    return false;
  }
}
