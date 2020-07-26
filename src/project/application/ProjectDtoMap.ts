import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Project } from 'project/domain/project/Project';
import { ProjectDto } from './dto/ProjectDto';
import { User } from 'user/domain/User';
import { RoleDto } from './dto/RoleDto';
import { PeerReviewDto } from './dto/PeerReviewDto';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { Injectable } from '@nestjs/common';
import { getProjectStateValue } from 'project/domain/project/value-objects/states/ProjectStateValue';
import { ReviewTopicDto } from './dto/ReviewTopicDto';
import { ContributionDto } from './dto/ContributionDto';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import { ReadonlyContribution } from 'project/domain/contribution/Contribution';
import { ArchivedProjectState } from 'project/domain/project/value-objects/states/ArchivedProjectState';

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
      project.meta,
      project.creatorId.value,
      getProjectStateValue(project.state),
      project.contributionVisibility.asValue(),
      project.peerReviewVisibility.label,
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
      await this.mapContributions(project, authUser),
    );
  }

  private async mapPeerReviewDtos(
    project: Project,
    authUser: User,
  ): Promise<PeerReviewDto[]> {
    return this.objectMapper.mapArray(
      project.peerReviews.filterVisible(project, authUser).toArray(),
      PeerReviewDto,
      { project, authUser, peerReviews: project.peerReviews },
    );
  }

  public async mapContributions(
    project: Project,
    authUser: User,
  ): Promise<Array<ContributionDto>> {
    return this.objectMapper.mapArray(
      project.contributions.where(shouldExpose).toArray(),
      ContributionDto,
      { authUser, project },
    );
    function shouldExpose(contribution: ReadonlyContribution): boolean {
      return project.contributionVisibility.accept({
        public(): boolean {
          return project.state.equalsAny([
            FinishedProjectState.INSTANCE,
            ArchivedProjectState.INSTANCE,
          ]);
        },
        project(): boolean {
          if (project.isCreator(authUser)) {
            return true;
          }
          if (
            !project.state.equalsAny([
              FinishedProjectState.INSTANCE,
              ArchivedProjectState.INSTANCE,
            ])
          ) {
            return false;
          }
          return project.roles.isAnyAssignedToUser(authUser);
        },
        self(): boolean {
          if (project.isCreator(authUser)) {
            return true;
          }
          if (
            !project.state.equalsAny([
              FinishedProjectState.INSTANCE,
              ArchivedProjectState.INSTANCE,
            ])
          ) {
            return false;
          }
          if (!project.roles.isAnyAssignedToUser(authUser)) {
            return false;
          }
          const role = project.roles.whereId(contribution.roleId);
          return role.isAssignedToUser(authUser);
        },
        none(): boolean {
          return project.isCreator(authUser);
        },
      });
    }
  }
}
