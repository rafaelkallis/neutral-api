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
import { FinishedMilestoneState } from 'project/domain/milestone/value-objects/states/FinishedMilestoneState';
import { MilestoneDto } from './dto/MilestoneDto';
import { ReadonlyRoleMetric } from 'project/domain/role-metric/RoleMetric';
import { RoleMetricDto } from './dto/RoleMetricDto';
import { ReadonlyMilestoneMetric } from 'project/domain/milestone-metric/MilestoneMetric';
import { MilestoneMetricDto } from './dto/MilestoneMetricDto';

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
    const roleMetrics = await this.mapRoleMetrics(project, authUser);
    const milestoneMetrics = await this.mapMilestoneMetrics(project, authUser);
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
      roleMetrics,
      milestoneMetrics,
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
      project,
      authUser,
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

  public async mapMilestoneMetrics(
    project: Project,
    authUser: User,
  ): Promise<MilestoneMetricDto[]> {
    const visibleMilestoneMetrics = project.milestoneMetrics
      .toArray()
      .filter((milestoneMetric) =>
        this.shouldExposeMilestoneMetric(project, authUser, milestoneMetric),
      );
    return this.objectMapper.mapIterable(
      visibleMilestoneMetrics,
      MilestoneMetricDto,
      {
        project,
        authUser,
      },
    );
  }

  public shouldExposeMilestoneMetric(
    project: Project,
    authUser: User,
    milestoneMetric: ReadonlyMilestoneMetric,
  ): boolean {
    const milestone = project.milestones.whereId(milestoneMetric.milestoneId);
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
        // same as project
        if (project.isCreator(authUser)) {
          return true;
        }
        if (!milestone.state.equals(FinishedMilestoneState.INSTANCE)) {
          return false;
        }
        return project.roles.isAnyAssignedToUser(authUser);
      },
      none(): boolean {
        return project.isCreator(authUser);
      },
    });
  }
}
