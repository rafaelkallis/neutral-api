import { User } from 'user/domain/User';
import { Role } from 'project/domain/Role';
import { ProjectPeerReview } from 'project/domain/value-objects/states/ProjectPeerReview';
import { ProjectFinished } from 'project/domain/value-objects/states/ProjectFinished';
import { Project } from 'project/domain/Project';
import { ContributionVisibility } from 'project/domain/value-objects/ContributionVisibility';
import { Contribution } from 'project/domain/value-objects/Contribution';
import { HasSubmittedPeerReviews } from 'project/domain/value-objects/HasSubmittedPeerReviews';
import { ModelFaker } from 'test/ModelFaker';
import { RoleDtoMap } from 'project/application/RoleDtoMap';

describe('role dto map', () => {
  let modelFaker: ModelFaker;
  let roleDtoMap: RoleDtoMap;
  let users: Record<string, User>;
  let role: Role;
  let project: Project;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    roleDtoMap = new RoleDtoMap();
    users = {
      owner: modelFaker.user(),
      assignee: modelFaker.user(),
      projectUser: modelFaker.user(),
      publicUser: modelFaker.user(),
    };
    project = modelFaker.project(users.owner.id);
    project.state = ProjectFinished.INSTANCE;
    project.roles.addAll([
      modelFaker.role(users.assignee.id),
      modelFaker.role(users.projectUser.id),
    ]);
    role = project.roles.findByAssignee(users.assignee);
    role.hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
  });

  const { PUBLIC, PROJECT, SELF, NONE } = ContributionVisibility;
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
    (contributionVisibility, authUser, isContributionVisible) => {
      project.contributionVisibility = contributionVisibility;
      role.contribution = Contribution.from(1);
      const roleDto = roleDtoMap.map(role, {
        project,
        authUser: users[authUser],
      });
      expect(Boolean(roleDto.contribution)).toBe(isContributionVisible);
    },
  );

  test('should not show contribution if not project owner and if project not finished', () => {
    project.contributionVisibility = ContributionVisibility.PUBLIC;
    project.state = ProjectPeerReview.INSTANCE;
    role.contribution = Contribution.from(1);
    const roleDto = roleDtoMap.map(role, { project, authUser: users.assignee });
    expect(roleDto.contribution).toBeFalsy();
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

  const hasSubmittedPeerReviewsCases: [string, boolean][] = [
    ['owner', true],
    ['assignee', true],
    ['projectUser', false],
    ['publicUser', false],
  ];

  test.each(hasSubmittedPeerReviewsCases)(
    'has submitted peer reviews',
    (authUser, isHasSubmittedPeerReviewsVisible) => {
      const roleDto = roleDtoMap.map(role, {
        project,
        authUser: users[authUser],
      });
      expect(Boolean(roleDto.hasSubmittedPeerReviews)).toBe(
        isHasSubmittedPeerReviewsVisible,
      );
    },
  );
});
