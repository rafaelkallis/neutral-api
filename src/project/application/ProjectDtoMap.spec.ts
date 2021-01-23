import td from 'testdouble';
import { User } from 'user/domain/User';
import { InternalProject } from 'project/domain/project/Project';
import { ModelFaker } from 'test/ModelFaker';
import { ProjectDtoMap } from 'project/application/ProjectDtoMap';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { RoleDto } from 'project/application/dto/RoleDto';
import { PeerReviewDto } from './dto/PeerReviewDto';
import { getProjectStateValue } from 'project/domain/project/value-objects/states/ProjectStateValue';
import { ReviewTopicDto } from './dto/ReviewTopicDto';
import {
  ProjectContributionVisiblity,
  PublicContributionVisiblity,
  SelfContributionVisiblity,
  NoneContributionVisiblity,
  ContributionVisibility,
} from 'project/domain/project/value-objects/ContributionVisibility';
import { FinishedMilestoneState } from 'project/domain/milestone/value-objects/states/FinishedMilestoneState';
import { MilestoneDto } from './dto/MilestoneDto';
import { RoleMetricDto } from './dto/RoleMetricDto';
import { RoleMetric } from 'project/domain/role-metric/RoleMetric';
import { Contribution } from 'project/domain/value-objects/Contribution';
import { Agreement } from 'project/domain/value-objects/Agreement';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { RoleMetricCollection } from 'project/domain/role-metric/RoleMetricCollection';
import { MilestoneMetric } from 'project/domain/milestone-metric/MilestoneMetric';
import { ContributionSymmetry } from 'project/domain/value-objects/ContributionSymmetry';
import { MilestoneMetricCollection } from 'project/domain/milestone-metric/RoleMetricCollection';

describe('' + ProjectDtoMap.name, () => {
  let objectMapper: ObjectMapper;
  let projectDtoMap: ProjectDtoMap;
  let modelFaker: ModelFaker;
  let creator: User;
  let authUser: User;
  let project: InternalProject;

  let roleDtos: RoleDto[];
  let peerReviewDtos: PeerReviewDto[];
  let reviewTopicDtos: ReviewTopicDto[];
  let milestoneDtos: MilestoneDto[];
  let roleMetricDtos: RoleMetricDto[];

  beforeEach(() => {
    objectMapper = td.object();
    projectDtoMap = new ProjectDtoMap(objectMapper);
    modelFaker = new ModelFaker();
    creator = modelFaker.user();
    authUser = modelFaker.user();
    project = modelFaker.project(creator.id);

    roleDtos = [];
    td.when(
      objectMapper.mapIterable(project.roles, RoleDto, td.matchers.anything()),
    ).thenResolve(roleDtos);
    peerReviewDtos = [];
    td.when(
      objectMapper.mapIterable(
        project.peerReviews,
        PeerReviewDto,
        td.matchers.anything(),
      ),
    ).thenResolve(peerReviewDtos);
    reviewTopicDtos = [];
    td.when(
      objectMapper.mapIterable(project.reviewTopics, ReviewTopicDto, {
        authUser,
        project,
      }),
    ).thenResolve(reviewTopicDtos);
    milestoneDtos = [];
    td.when(
      objectMapper.mapIterable(project.milestones, MilestoneDto, {
        authUser,
        project,
      }),
    ).thenResolve(milestoneDtos);
    roleMetricDtos = [];
    td.when(
      objectMapper.mapIterable(td.matchers.anything(), RoleMetricDto, {
        authUser,
        project,
      }),
    ).thenResolve(roleMetricDtos);
  });

  test('general', async () => {
    const projectDto = await projectDtoMap.map(project, { authUser });
    expect(projectDto).toEqual({
      id: project.id.value,
      title: project.title.value,
      description: project.description.value,
      meta: project.meta,
      creatorId: project.creatorId.value,
      state: getProjectStateValue(project.state),
      contributionVisibility: 'self',
      peerReviewVisibility: 'manager',
      skipManagerReview: project.skipManagerReview.value,
      roles: roleDtos,
      peerReviews: peerReviewDtos,
      reviewTopics: reviewTopicDtos,
      milestones: milestoneDtos,
      roleMetrics: roleMetricDtos,
      createdAt: project.createdAt.value,
      updatedAt: project.updatedAt.value,
    });
  });

  describe('role metric visibility', () => {
    const PUBLIC = PublicContributionVisiblity.INSTANCE;
    const PROJECT = ProjectContributionVisiblity.INSTANCE;
    const SELF = SelfContributionVisiblity.INSTANCE;
    const NONE = NoneContributionVisiblity.INSTANCE;
    const roleMetricCases: [ContributionVisibility, string, boolean][] = [
      [PUBLIC, 'creator', true],
      [PUBLIC, 'assignee', true],
      [PUBLIC, 'projectUser', true],
      [PUBLIC, 'publicUser', true],
      [PROJECT, 'creator', true],
      [PROJECT, 'assignee', true],
      [PROJECT, 'projectUser', true],
      [PROJECT, 'publicUser', false],
      [SELF, 'creator', true],
      [SELF, 'assignee', true],
      [SELF, 'projectUser', false],
      [SELF, 'publicUser', false],
      [NONE, 'creator', true],
      [NONE, 'assignee', false],
      [NONE, 'projectUser', false],
      [NONE, 'publicUser', false],
    ];

    let roleMetric: RoleMetric;
    let users: Record<string, User>;

    beforeEach(() => {
      users = {
        creator,
        assignee: modelFaker.user(),
        projectUser: modelFaker.user(),
        publicUser: modelFaker.user(),
      };
      // project.state = FinishedProjectState.INSTANCE; // TODO or archived?
      project.roles.addAll([
        modelFaker.role(users.assignee.id),
        modelFaker.role(users.projectUser.id),
      ]);
      const role = project.roles.whereAssignee(users.assignee);
      const reviewTopic = modelFaker.reviewTopic();
      project.reviewTopics.add(reviewTopic);
      const milestone = modelFaker.milestone(project);
      milestone.state = FinishedMilestoneState.INSTANCE;
      project.milestones.add(milestone);
      roleMetric = RoleMetric.create(
        project,
        role.id,
        reviewTopic.id,
        milestone.id,
        Contribution.of(1),
        Consensuality.of(1),
        Agreement.of(1),
      );
      project.roleMetrics = new RoleMetricCollection([roleMetric]);
    });

    test.each(roleMetricCases)(
      'roleMetric',
      (contributionVisibility, authUserKey, expectedIsContributionExposed) => {
        project.contributionVisibility = contributionVisibility;
        const actualIsRoleMetricExposed = projectDtoMap.shouldExposeRoleMetric(
          project,
          users[authUserKey],
          roleMetric,
        );
        expect(actualIsRoleMetricExposed).toBe(expectedIsContributionExposed);
      },
    );
  });

  describe('milestone metric visibility', () => {
    const PUBLIC = PublicContributionVisiblity.INSTANCE;
    const PROJECT = ProjectContributionVisiblity.INSTANCE;
    const SELF = SelfContributionVisiblity.INSTANCE;
    const NONE = NoneContributionVisiblity.INSTANCE;
    const milestoneMetricCases: [ContributionVisibility, string, boolean][] = [
      [PUBLIC, 'creator', true],
      [PUBLIC, 'assignee', true],
      [PUBLIC, 'projectUser', true],
      [PUBLIC, 'publicUser', true],
      [PROJECT, 'creator', true],
      [PROJECT, 'assignee', true],
      [PROJECT, 'projectUser', true],
      [PROJECT, 'publicUser', false],
      [SELF, 'creator', true],
      [SELF, 'assignee', true],
      [SELF, 'projectUser', true],
      [SELF, 'publicUser', false],
      [NONE, 'creator', true],
      [NONE, 'assignee', false],
      [NONE, 'projectUser', false],
      [NONE, 'publicUser', false],
    ];

    let milestoneMetric: MilestoneMetric;
    let users: Record<string, User>;

    beforeEach(() => {
      users = {
        creator,
        assignee: modelFaker.user(),
        projectUser: modelFaker.user(),
        publicUser: modelFaker.user(),
      };
      // project.state = FinishedProjectState.INSTANCE; // TODO or archived?
      project.roles.addAll([
        modelFaker.role(users.assignee.id),
        modelFaker.role(users.projectUser.id),
      ]);
      const reviewTopic = modelFaker.reviewTopic();
      project.reviewTopics.add(reviewTopic);
      const milestone = modelFaker.milestone(project);
      milestone.state = FinishedMilestoneState.INSTANCE;
      project.milestones.add(milestone);
      milestoneMetric = MilestoneMetric.create(
        project,
        reviewTopic.id,
        milestone.id,
        ContributionSymmetry.of(1),
        Consensuality.of(1),
        Agreement.of(1),
      );
      project.milestoneMetrics = new MilestoneMetricCollection([
        milestoneMetric,
      ]);
    });

    test.each(milestoneMetricCases)(
      'milestoneMetric',
      (contributionVisibility, authUserKey, expectedIsContributionExposed) => {
        project.contributionVisibility = contributionVisibility;
        const actualIsRoleMetricExposed = projectDtoMap.shouldExposeMilestoneMetric(
          project,
          users[authUserKey],
          milestoneMetric,
        );
        expect(actualIsRoleMetricExposed).toBe(expectedIsContributionExposed);
      },
    );
  });
});
