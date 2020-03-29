import {
  ModelMap,
  AbstractModelMap,
  ModelMapContext,
} from 'shared/model-mapper/ModelMap';
import { Project } from 'project/domain/Project';
import { User } from 'user/domain/User';
import { InternalServerErrorException } from '@nestjs/common';
import { RoleDto } from 'project/application/dto/RoleDto';
import { Role } from 'project/domain/Role';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { ContributionVisibility } from 'project/domain/value-objects/ContributionVisibility';

@ModelMap(Role, RoleDto)
export class RoleDtoMap extends AbstractModelMap<Role, RoleDto> {
  public map(role: Role, { project, authUser }: ModelMapContext): RoleDto {
    if (!(project instanceof Project) || !(authUser instanceof User)) {
      throw new InternalServerErrorException();
    }
    return new RoleDto(
      role.id.value,
      role.projectId.value,
      role.assigneeId ? role.assigneeId.value : null,
      role.title.value,
      role.description.value,
      this.mapContribution(role, project, authUser),
      this.mapHasSubmittedPeerReviews(role, project, authUser),
      role.createdAt.value,
      role.updatedAt.value,
    );
  }

  private mapContribution(
    role: Role,
    project: Project,
    authUser: User,
  ): number | null {
    if (role.contribution === null) {
      return null;
    }
    let shouldExpose = false;
    switch (project.contributionVisibility) {
      case ContributionVisibility.PUBLIC: {
        shouldExpose = project.state.equals(ProjectState.FINISHED);
        break;
      }

      case ContributionVisibility.PROJECT: {
        if (project.isCreator(authUser)) {
          shouldExpose = true;
        } else if (!project.state.equals(ProjectState.FINISHED)) {
          shouldExpose = false;
        } else {
          shouldExpose = project.roles.anyAssignedToUser(authUser);
        }
        break;
      }

      case ContributionVisibility.SELF: {
        if (project.isCreator(authUser)) {
          shouldExpose = true;
        } else if (!project.state.equals(ProjectState.FINISHED)) {
          shouldExpose = false;
        } else {
          shouldExpose = role.isAssignedToUser(authUser);
        }
        break;
      }

      case ContributionVisibility.NONE: {
        shouldExpose = project.isCreator(authUser);
        break;
      }

      default: {
        throw new InternalServerErrorException();
      }
    }
    return shouldExpose ? role.contribution.value : null;
  }

  private mapHasSubmittedPeerReviews(
    role: Role,
    project: Project,
    authUser: User,
  ): boolean | null {
    let shouldExpose = false;
    if (project.isCreator(authUser)) {
      shouldExpose = true;
    }
    if (role.isAssignedToUser(authUser)) {
      shouldExpose = true;
    }
    return shouldExpose ? role.hasSubmittedPeerReviews.value : null;
  }
}
