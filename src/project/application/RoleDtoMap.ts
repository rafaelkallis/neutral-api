import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Project, ReadonlyProject } from 'project/domain/project/Project';
import { User, ReadonlyUser } from 'user/domain/User';
import { Injectable } from '@nestjs/common';
import { RoleDto } from 'project/application/dto/RoleDto';
import { Role, ReadonlyRole } from 'project/domain/role/Role';
import { PeerReviewMilestoneState } from 'project/domain/milestone/value-objects/states/PeerReviewMilestoneState';

@Injectable()
@ObjectMap.register(Role, RoleDto)
export class RoleDtoMap extends ObjectMap<Role, RoleDto> {
  protected doMap(role: Role, context: ObjectMapContext): RoleDto {
    const project = context.get('project', Project);
    const authUser = context.get('authUser', User);
    return new RoleDto(
      role.id.value,
      role.createdAt.value,
      role.updatedAt.value,
      project.id.value,
      role.assigneeId ? role.assigneeId.value : null,
      role.title.value,
      role.description.value,
      this.mapHasSubmittedPeerReviews(role, project, authUser),
    );
  }

  private mapHasSubmittedPeerReviews(
    senderRole: ReadonlyRole,
    project: ReadonlyProject,
    authUser: ReadonlyUser,
  ): boolean | undefined {
    if (!project.isCreator(authUser)) {
      return undefined;
    }
    if (project.milestones.isEmpty()) {
      return undefined;
    }
    if (
      !project.latestMilestone.state.equals(PeerReviewMilestoneState.INSTANCE)
    ) {
      return undefined;
    }
    return project.peerReviews.areCompleteForSenderRole(
      project.latestMilestone,
      senderRole.id,
    );
  }
}
