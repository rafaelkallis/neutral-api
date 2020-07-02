import { User } from 'user/domain/User';
import { Role } from 'project/domain/role/Role';
import { PeerReviewProjectState } from 'project/domain/project/value-objects/states/PeerReviewProjectState';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import { InternalProject } from 'project/domain/project/Project';
import {
  ContributionVisibility,
  PublicContributionVisiblity,
  ProjectContributionVisiblity,
  SelfContributionVisiblity,
  NoneContributionVisiblity,
} from 'project/domain/project/value-objects/ContributionVisibility';
import { ContributionAmount } from 'project/domain/role/value-objects/ContributionAmount';
import { ModelFaker } from 'test/ModelFaker';
import { RoleDtoMap } from 'project/application/RoleDtoMap';
import { ContributionCollection } from 'project/domain/contribution/ContributionCollection';
import { Contribution } from 'project/domain/contribution/Contribution';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';

describe('role dto map', () => {
  let modelFaker: ModelFaker;
  let roleDtoMap: RoleDtoMap;
  let users: Record<string, User>;
  let role: Role;
  let reviewTopic: ReviewTopic;
  let project: InternalProject;

  beforeEach(() => {
    modelFaker = new ModelFaker();
    roleDtoMap = new RoleDtoMap();
    users = {
      owner: modelFaker.user(),
      assignee: modelFaker.user(),
      projectUser: modelFaker.user(),
      publicUser: modelFaker.user(),
    };
    project = modelFaker.project(users.owner.id);
    project.state = FinishedProjectState.INSTANCE;
    project.roles.addAll([
      modelFaker.role(users.assignee.id),
      modelFaker.role(users.projectUser.id),
    ]);
    role = project.roles.whereAssignee(users.assignee);
    reviewTopic = modelFaker.reviewTopic();
    project.reviewTopics.add(reviewTopic);
    project.contributions = new ContributionCollection([
      Contribution.from(role.id, reviewTopic.id, ContributionAmount.from(1)),
    ]);
  });

  const PUBLIC = PublicContributionVisiblity.INSTANCE;
  const PROJECT = ProjectContributionVisiblity.INSTANCE;
  const SELF = SelfContributionVisiblity.INSTANCE;
  const NONE = NoneContributionVisiblity.INSTANCE;
  const contributionCases: [ContributionVisibility, string, boolean][] = [
    [PUBLIC, 'owner', true],
    [PUBLIC, 'assignee', true],
    [PUBLIC, 'projectUser', true],
    [PUBLIC, 'publicUser', true],
    [PROJECT, 'owner', true],
    [PROJECT, 'assignee', true],
    [PROJECT, 'projectUser', true],
    [PROJECT, 'publicUser', false],
    [SELF, 'owner', true],
    [SELF, 'assignee', true],
    [SELF, 'projectUser', false],
    [SELF, 'publicUser', false],
    [NONE, 'owner', true],
    [NONE, 'assignee', false],
    [NONE, 'projectUser', false],
    [NONE, 'publicUser', false],
  ];

  test.each(contributionCases)(
    'contributions',
    async (contributionVisibility, authUser, isContributionVisible) => {
      project.contributionVisibility = contributionVisibility;
      const roleDto = await roleDtoMap.map(role, {
        project,
        authUser: users[authUser],
      });
      expect(Boolean(roleDto.contribution)).toBe(isContributionVisible);
    },
  );

  test('should not show contribution if not project owner and if project not finished', async () => {
    project.contributionVisibility = PublicContributionVisiblity.INSTANCE;
    project.state = PeerReviewProjectState.INSTANCE;
    const roleDto = await roleDtoMap.map(role, {
      project,
      authUser: users.assignee,
    });
    expect(roleDto.contribution).toBeNull();
  });

  // const sentPeerReviewsCases: [string, boolean][] = [
  //   ['owner', true],
  //   ['assignee', true],
  //   ['projectUser', false],
  //   ['publicUser', false],
  // ];

  // test.each(sentPeerReviewsCases)(
  //   'sent peer reviews',
  //   (authUser, areSentPeerReviewsVisible) => {
  //     const roleDto = RoleDto.builder()
  //       .role(role)
  //       .project(project)
  //       .authUser(users[authUser])
  //       .build();
  //     expect(Boolean(roleDto.submittedPeerReviews)).toBe(
  //       areSentPeerReviewsVisible,
  //     );
  //   },
  // );

  // const hasSubmittedPeerReviewsCases: [string, boolean][] = [
  //   ['owner', true],
  //   ['assignee', true],
  //   ['projectUser', false],
  //   ['publicUser', false],
  // ];

  // test.each(hasSubmittedPeerReviewsCases)(
  //   'has submitted peer reviews',
  //   (authUser, isHasSubmittedPeerReviewsVisible) => {
  //     const roleDto = roleDtoMap.map(role, {
  //       project,
  //       authUser: users[authUser],
  //     });
  //     expect(Boolean(roleDto.hasSubmittedPeerReviews)).toBe(
  //       isHasSubmittedPeerReviewsVisible,
  //     );
  //   },
  // );
});
