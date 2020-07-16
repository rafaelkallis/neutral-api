import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Project } from 'project/domain/project/Project';
import { User } from 'user/domain/User';
import { InternalServerErrorException, Injectable } from '@nestjs/common';
import { RoleDto } from 'project/application/dto/RoleDto';
import { Role } from 'project/domain/role/Role';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import {
  PublicContributionVisiblity,
  ProjectContributionVisiblity,
  SelfContributionVisiblity,
  NoneContributionVisiblity,
} from 'project/domain/project/value-objects/ContributionVisibility';
import { ArchivedProjectState } from 'project/domain/project/value-objects/states/ArchivedProjectState';

@Injectable()
@ObjectMap.register(Role, RoleDto)
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

  // TODO remove (contributions are a propoerty of project)
  private mapContribution(
    role: Role,
    project: Project,
    authUser: User,
  ): number | null {
    const [contribution] = project.contributions.whereRole(role).toArray();
    if (!contribution) {
      return null;
    }
    let shouldExpose = false;
    // TODO: move knowledge to ContributionVisiblity?
    switch (project.contributionVisibility) {
      case PublicContributionVisiblity.INSTANCE: {
        shouldExpose = project.state.equalsAny([
          FinishedProjectState.INSTANCE,
          ArchivedProjectState.INSTANCE,
        ]);
        break;
      }

      case ProjectContributionVisiblity.INSTANCE: {
        if (project.isCreator(authUser)) {
          shouldExpose = true;
        } else if (
          !project.state.equalsAny([
            FinishedProjectState.INSTANCE,
            ArchivedProjectState.INSTANCE,
          ])
        ) {
          shouldExpose = false;
        } else {
          shouldExpose = project.roles.isAnyAssignedToUser(authUser);
        }
        break;
      }

      case SelfContributionVisiblity.INSTANCE: {
        if (project.isCreator(authUser)) {
          shouldExpose = true;
        } else if (
          !project.state.equalsAny([
            FinishedProjectState.INSTANCE,
            ArchivedProjectState.INSTANCE,
          ])
        ) {
          shouldExpose = false;
        } else {
          shouldExpose = role.isAssignedToUser(authUser);
        }
        break;
      }

      case NoneContributionVisiblity.INSTANCE: {
        shouldExpose = project.isCreator(authUser);
        break;
      }

      default: {
        throw new InternalServerErrorException();
      }
    }
    return shouldExpose ? contribution.amount.value : null;
  }
}
