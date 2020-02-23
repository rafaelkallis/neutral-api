import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'common/application/dto/BaseDto';
import { User } from 'user/domain/User';
import { Role } from 'project/domain/Role';
import {
  PeerReviewDto,
  PeerReviewDtoBuilder,
} from 'project/application/dto/PeerReviewDto';
import { PeerReview } from 'project/domain/PeerReview';
import { InternalServerErrorException } from '@nestjs/common';
import { Project } from 'project/domain/Project';
import { ContributionVisibility } from 'project/domain/value-objects/ContributionVisibility';
import { ProjectState } from 'project/domain/value-objects/ProjectState';

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
  role(role: Role): ProjectStep;
}

interface ProjectStep {
  project(project: Project): ProjectRolesStep;
}

interface ProjectRolesStep {
  projectRoles(projectRoles: Role[]): AuthUserStep;
}

interface AuthUserStep {
  authUser(authUser: User): BuildStep;
}

interface BuildStep {
  build(): Promise<RoleDto>;
  addSubmittedPeerReviews(
    getSubmittedPeerReviews: () => Promise<PeerReview[]>,
  ): BuildStep;
}

/**
 * Role DTO Builder
 */
class RoleDtoBuilder
  implements RoleStep, ProjectStep, ProjectRolesStep, AuthUserStep, BuildStep {
  private _role!: Role;
  private _project!: Project;
  private _projectRoles!: Role[];
  private _authUser!: User;
  private _getSubmittedPeerReviews?: () => Promise<PeerReview[]>;

  public role(role: Role): ProjectStep {
    this._role = role;
    return this;
  }

  public project(project: Project): ProjectRolesStep {
    this._project = project;
    return this;
  }

  public projectRoles(projectRoles: Role[]): AuthUserStep {
    this._projectRoles = projectRoles;
    return this;
  }

  public authUser(authUser: User): BuildStep {
    this._authUser = authUser;
    return this;
  }

  public addSubmittedPeerReviews(
    getSentPeerReviews: () => Promise<PeerReview[]>,
  ): BuildStep {
    this._getSubmittedPeerReviews = getSentPeerReviews;
    return this;
  }

  public async build(): Promise<RoleDto> {
    const { _role: role } = this;
    const roleDto = new RoleDto(
      role.id.value,
      role.projectId.value,
      role.assigneeId ? role.assigneeId.value : null,
      role.title.value,
      role.description.value,
      this.shouldExposeContribution() && !!role.contribution
        ? role.contribution.value
        : null,
      null,
      this.shouldExposeHasSubmittedPeerReviews()
        ? role.hasSubmittedPeerReviews.value
        : null,
      role.createdAt.value,
      role.updatedAt.value,
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
        return project.state.equals(ProjectState.FINISHED);
      }

      case ContributionVisibility.PROJECT: {
        if (project.isCreator(authUser)) {
          return true;
        }
        if (!project.state.equals(ProjectState.FINISHED)) {
          return false;
        }
        return projectRoles.some(r => r.isAssignedToUser(authUser));
      }

      case ContributionVisibility.SELF: {
        if (project.isCreator(authUser)) {
          return true;
        }
        if (!project.state.equals(ProjectState.FINISHED)) {
          return false;
        }
        return role.isAssignedToUser(authUser);
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
    if (role.isAssignedToUser(authUser)) {
      return true;
    }
    return false;
  }

  private shouldExposeSubmittedPeerReviews(): boolean {
    const { _role: role, _project: project, _authUser: authUser } = this;
    if (project.isCreator(authUser)) {
      return true;
    }
    if (role.isAssignedToUser(authUser)) {
      return true;
    }
    return false;
  }
}
