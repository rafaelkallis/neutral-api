import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Project } from 'project/domain/project/Project';
import { ProjectDto } from './dto/ProjectDto';
import { User } from 'user/domain/User';
import { RoleDto } from './dto/RoleDto';
import { PeerReviewDto } from './dto/PeerReviewDto';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { Injectable, Type } from '@nestjs/common';
import { getProjectStateValue } from 'project/domain/project/value-objects/states/ProjectStateValue';

@Injectable()
export class ProjectDtoMap extends ObjectMap<Project, ProjectDto> {
  private readonly objectMapper: ObjectMapper;

  public constructor(objectMapper: ObjectMapper) {
    super();
    this.objectMapper = objectMapper;
  }

  protected doMap(project: Project, context: ObjectMapContext): ProjectDto {
    const authUser = context.get('authUser', User);
    return new ProjectDto(
      project.id.value,
      project.title.value,
      project.description.value,
      project.creatorId.value,
      getProjectStateValue(project.state),
      this.mapConsensuality(project, authUser),
      project.contributionVisibility.value,
      project.skipManagerReview.value,
      this.mapRoleDtos(project, authUser),
      this.mapPeerReviewDtos(project, authUser),
      project.createdAt.value,
      project.updatedAt.value,
    );
  }

  private mapConsensuality(project: Project, authUser: User): number | null {
    const shouldExpose = project.isCreator(authUser);
    if (!shouldExpose) {
      return null;
    }
    if (!project.consensuality) {
      return null;
    }
    return project.consensuality.value;
  }

  private mapRoleDtos(project: Project, authUser: User): RoleDto[] {
    return Array.from(
      this.objectMapper.mapIterable(project.roles, RoleDto, {
        project,
        authUser,
      }),
    );
  }

  private mapPeerReviewDtos(project: Project, authUser: User): PeerReviewDto[] {
    let peerReviews = Array.from(project.peerReviews);
    peerReviews = peerReviews.filter((peerReview) =>
      this.shouldExposePeerReview(peerReview, project, authUser),
    );
    return this.objectMapper.mapArray(peerReviews, PeerReviewDto, {
      project,
      authUser,
    });
  }

  private shouldExposePeerReview(
    peerReview: PeerReview,
    project: Project,
    authUser: User,
  ): boolean {
    if (project.isCreator(authUser)) {
      return true;
    }
    if (project.roles.isAnyAssignedToUser(authUser)) {
      const authUserRole = project.roles.findByAssignee(authUser);
      if (peerReview.isSenderRole(authUserRole)) {
        return true;
      }
    }
    return false;
  }

  public getSourceType(): Type<Project> {
    return Project;
  }

  public getTargetType(): Type<ProjectDto> {
    return ProjectDto;
  }
}
