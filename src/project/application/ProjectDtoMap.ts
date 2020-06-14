import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Project } from 'project/domain/project/Project';
import { ProjectDto } from './dto/ProjectDto';
import { User } from 'user/domain/User';
import { RoleDto } from './dto/RoleDto';
import { PeerReviewDto } from './dto/PeerReviewDto';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { Injectable } from '@nestjs/common';
import { getProjectStateValue } from 'project/domain/project/value-objects/states/ProjectStateValue';
import { ReviewTopicDto } from './dto/ReviewTopicDto';
import { ContributionDto } from './dto/ContributionDto';

@Injectable()
@ObjectMap.register(Project, ProjectDto)
export class ProjectDtoMap extends ObjectMap<Project, ProjectDto> {
  private readonly objectMapper: ObjectMapper;

  public constructor(objectMapper: ObjectMapper) {
    super();
    this.objectMapper = objectMapper;
  }

  protected async doMap(
    project: Project,
    context: ObjectMapContext,
  ): Promise<ProjectDto> {
    const authUser = context.get('authUser', User);
    return new ProjectDto(
      project.id.value,
      project.createdAt.value,
      project.updatedAt.value,
      project.title.value,
      project.description.value,
      project.creatorId.value,
      getProjectStateValue(project.state),
      null, // TODO remove
      project.contributionVisibility.value,
      project.skipManagerReview.value,
      await this.objectMapper.mapArray(project.roles.toArray(), RoleDto, {
        project,
        authUser,
      }),
      await this.mapPeerReviewDtos(project, authUser),
      await this.objectMapper.mapArray(
        project.reviewTopics.toArray(),
        ReviewTopicDto,
        { authUser, project },
      ),
      await this.objectMapper.mapArray(
        project.contributions.toArray(),
        ContributionDto,
        { authUser, project },
      ),
    );
  }

  private async mapPeerReviewDtos(
    project: Project,
    authUser: User,
  ): Promise<PeerReviewDto[]> {
    let peerReviews = project.peerReviews.toArray();
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
      const authUserRole = project.roles.whereAssignee(authUser);
      if (peerReview.isSenderRole(authUserRole)) {
        return true;
      }
    }
    return false;
  }
}
