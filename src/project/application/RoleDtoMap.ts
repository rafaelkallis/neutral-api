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
    const shouldExpose = project.isCreator(authUser);
    if (!shouldExpose) {
      return null;
    }
    if (!project.consensuality) {
      return null;
    }
    return project.consensuality.value;
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
