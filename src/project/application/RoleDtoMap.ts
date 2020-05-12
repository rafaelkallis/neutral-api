import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Project } from 'project/domain/project/Project';
import { User } from 'user/domain/User';
import { InternalServerErrorException, Injectable, Type } from '@nestjs/common';
import { RoleDto } from 'project/application/dto/RoleDto';
import { Role } from 'project/domain/role/Role';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import { ContributionVisibility } from 'project/domain/project/value-objects/ContributionVisibility';

@Injectable()
export class RoleDtoMap extends ObjectMap<Role, RoleDto> {
  protected doMap(role: Role, context: ObjectMapContext): RoleDto {
    const project = context.get('project', Project);
    const authUser = context.get('authUser', User);
    return new RoleDto(
      role.id.value,
      project.id.value,
      role.assigneeId ? role.assigneeId.value : null,
      role.title.value,
      role.description.value,
      this.mapContribution(role, project, authUser),
      role.createdAt.value,
      role.updatedAt.value,
    );
  }

  private mapContribution(
    role: Role,
    project: Project,
    authUser: User,
  ): number | null {
    const [contribution] = project.contributions.findByRole(role).toArray();
    if (!contribution) {
      return null;
    }
    let shouldExpose = false;
    // TODO: move knowledge to ContributionVisiblity?
    switch (project.contributionVisibility) {
      case ContributionVisibility.PUBLIC: {
        shouldExpose = project.state.equals(FinishedProjectState.INSTANCE);
        break;
      }

      case ContributionVisibility.PROJECT: {
        if (project.isCreator(authUser)) {
          shouldExpose = true;
        } else if (!project.state.equals(FinishedProjectState.INSTANCE)) {
          shouldExpose = false;
        } else {
          shouldExpose = project.roles.isAnyAssignedToUser(authUser);
        }
        break;
      }

      case ContributionVisibility.SELF: {
        if (project.isCreator(authUser)) {
          shouldExpose = true;
        } else if (!project.state.equals(FinishedProjectState.INSTANCE)) {
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
    return shouldExpose ? contribution.amount.value : null;
  }

  public getSourceType(): Type<Role> {
    return Role;
  }

  public getTargetType(): Type<RoleDto> {
    return RoleDto;
  }
}
