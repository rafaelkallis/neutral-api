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
import { ReadonlyContribution } from 'project/domain/contribution/Contribution';
import { FinishedMilestoneState } from 'project/domain/milestone/value-objects/states/FinishedMilestoneState';
import { MilestoneDto } from './dto/MilestoneDto';
import { ReadonlyRoleMetric } from 'project/domain/role-metric/RoleMetric';
import { RoleMetricDto } from './dto/RoleMetricDto';

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
    const roleDtos = await this.objectMapper.mapIterable(
      project.roles,
      RoleDto,
      { project, authUser },
    );
    const peerReviewDtos = await this.objectMapper.mapIterable(
      project.peerReviews.filterVisible(project, authUser),
      PeerReviewDto,
      { project, authUser, peerReviews: project.peerReviews },
    );
    const reviewTopicDtos = await this.objectMapper.mapIterable(
      project.reviewTopics,
      ReviewTopicDto,
      { authUser, project },
    );
    const milestoneDtos = await this.objectMapper.mapIterable(
      project.milestones,
      MilestoneDto,
      { authUser, project },
    );
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
      roleDtos,
      peerReviewDtos,
      reviewTopicDtos,
      milestoneDtos,
      await this.mapContributions(project, authUser),
      await this.mapRoleMetrics(project, authUser),
    );
  }

  public async mapContributions(
    project: Project,
    authUser: User,
  ): Promise<ContributionDto[]> {
    const visibleContributions = project.contributions.where((contribution) =>
      this.shouldExposeContribution(project, authUser, contribution),
    );
    return this.objectMapper.mapIterable(
      visibleContributions,
      ContributionDto,
      { authUser, project },
    );
  }

  public async mapRoleMetrics(
    project: Project,
    authUser: User,
  ): Promise<RoleMetricDto[]> {
    const visibleRoleMetrics = project.roleMetrics
      .toArray()
      .filter((roleMetric) =>
        this.shouldExposeRoleMetric(project, authUser, roleMetric),
      );
    return this.objectMapper.mapIterable(visibleRoleMetrics, RoleMetricDto, {
      authUser,
      project,
    });
  }

  public shouldExposeContribution(
    project: Project,
    authUser: User,
    contribution: ReadonlyContribution,
  ): boolean {
    return project.contributionVisibility.accept({
      public(): boolean {
        return contribution.milestone.state.equals(
          FinishedMilestoneState.INSTANCE,
        );
      },
      project(): boolean {
        if (project.isCreator(authUser)) {
          return true;
        }
        if (
          !contribution.milestone.state.equals(FinishedMilestoneState.INSTANCE)
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
          !contribution.milestone.state.equals(FinishedMilestoneState.INSTANCE)
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

  public shouldExposeRoleMetric(
    project: Project,
    authUser: User,
    roleMetric: ReadonlyRoleMetric,
  ): boolean {
    const milestone = project.milestones.whereId(roleMetric.milestoneId);
    return project.contributionVisibility.accept({
      public(): boolean {
        return milestone.state.equals(FinishedMilestoneState.INSTANCE);
      },
      project(): boolean {
        if (project.isCreator(authUser)) {
          return true;
        }
        if (!milestone.state.equals(FinishedMilestoneState.INSTANCE)) {
          return false;
        }
        return project.roles.isAnyAssignedToUser(authUser);
      },
      self(): boolean {
        if (project.isCreator(authUser)) {
          return true;
        }
        if (!milestone.state.equals(FinishedMilestoneState.INSTANCE)) {
          return false;
        }
        if (!project.roles.isAnyAssignedToUser(authUser)) {
          return false;
        }
        const role = project.roles.whereId(roleMetric.roleId);
        return role.isAssignedToUser(authUser);
      },
      none(): boolean {
        return project.isCreator(authUser);
      },
    });
  }
}
