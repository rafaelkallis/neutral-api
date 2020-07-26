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
import { ContributionDto } from './dto/ContributionDto';
import {
  ProjectContributionVisiblity,
  PublicContributionVisiblity,
  SelfContributionVisiblity,
  NoneContributionVisiblity,
  ContributionVisibility,
} from 'project/domain/project/value-objects/ContributionVisibility';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import { Contribution } from 'project/domain/contribution/Contribution';
import { ContributionCollection } from 'project/domain/contribution/ContributionCollection';
import { ContributionAmount } from 'project/domain/role/value-objects/ContributionAmount';

describe(ProjectDtoMap.name, () => {
  let objectMapper: ObjectMapper;
  let projectDtoMap: ProjectDtoMap;
  let modelFaker: ModelFaker;
  let creator: User;
  let authUser: User;
  let project: InternalProject;

  let roleDtos: RoleDto[];
  let peerReviewDtos: PeerReviewDto[];
  let reviewTopicDtos: ReviewTopicDto[];
  let contributionDtos: ContributionDto[];

  beforeEach(() => {
    objectMapper = td.object();
    projectDtoMap = new ProjectDtoMap(objectMapper);
    modelFaker = new ModelFaker();
    creator = modelFaker.user();
    authUser = modelFaker.user();
    project = modelFaker.project(creator.id);

    roleDtos = [];
    td.when(
      objectMapper.mapArray(
        project.roles.toArray(),
        RoleDto,
        td.matchers.anything(),
      ),
    ).thenResolve(roleDtos);
    peerReviewDtos = [];
    td.when(
      objectMapper.mapArray(
        project.peerReviews.toArray(),
        PeerReviewDto,
        td.matchers.anything(),
      ),
    ).thenResolve(peerReviewDtos);
    reviewTopicDtos = [];
    td.when(
      objectMapper.mapArray(project.reviewTopics.toArray(), ReviewTopicDto, {
        authUser,
        project,
      }),
    ).thenResolve(reviewTopicDtos);
    contributionDtos = [];
    td.when(
      objectMapper.mapArray(project.contributions.toArray(), ContributionDto, {
        authUser,
        project,
      }),
    ).thenResolve(contributionDtos);
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
      contributions: contributionDtos,
      createdAt: project.createdAt.value,
      updatedAt: project.updatedAt.value,
    });
  });

  describe('contribution visibility', () => {
    const PUBLIC = PublicContributionVisiblity.INSTANCE;
    const PROJECT = ProjectContributionVisiblity.INSTANCE;
    const SELF = SelfContributionVisiblity.INSTANCE;
    const NONE = NoneContributionVisiblity.INSTANCE;
    const contributionCases: [ContributionVisibility, string, boolean][] = [
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

    let contribution: Contribution;
    let users: Record<string, User>;

    beforeEach(() => {
      users = {
        creator,
        assignee: modelFaker.user(),
        projectUser: modelFaker.user(),
        publicUser: modelFaker.user(),
      };
      project.state = FinishedProjectState.INSTANCE; // TODO or archived?
      project.roles.addAll([
        modelFaker.role(users.assignee.id),
        modelFaker.role(users.projectUser.id),
      ]);
      const role = project.roles.whereAssignee(users.assignee);
      const reviewTopic = modelFaker.reviewTopic();
      project.reviewTopics.add(reviewTopic);
      contribution = Contribution.from(
        role.id,
        reviewTopic.id,
        ContributionAmount.from(1),
      );
      project.contributions = new ContributionCollection([contribution]);
    });

    test.each(contributionCases)(
      'contributions',
      async (contributionVisibility, authUserKey, isContributionVisible) => {
        project.contributionVisibility = contributionVisibility;
        await projectDtoMap.mapContributions(project, users[authUserKey]);
        if (isContributionVisible) {
          td.verify(
            objectMapper.mapArray(
              [contribution],
              ContributionDto,
              td.matchers.anything(),
            ),
          );
        } else {
          td.verify(
            objectMapper.mapArray([], ContributionDto, td.matchers.anything()),
          );
        }
      },
    );
  });
});
