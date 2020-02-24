import { User } from 'user/domain/User';
import { Role } from 'project/domain/Role';
import { RoleDto } from 'project/application/dto/RoleDto';
import { ModelFaker } from 'test';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { Project } from 'project/domain/Project';
import { ContributionVisibility } from 'project/domain/value-objects/ContributionVisibility';
import { Contribution } from 'project/domain/value-objects/Contribution';
import { HasSubmittedPeerReviews } from 'project/domain/value-objects/HasSubmittedPeerReviews';

describe('role dto', () => {
  let modelFaker: ModelFaker;
  let users: Record<string, User>;
  let role: Role;
  let roles: Role[];
  let project: Project;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    users = {
      owner: modelFaker.user(),
      assignee: modelFaker.user(),
      projectUser: modelFaker.user(),
      publicUser: modelFaker.user(),
    };
    project = modelFaker.project(users.owner.id);
    project.state = ProjectState.FINISHED;
    roles = [
      modelFaker.role(project.id, users.assignee.id),
      modelFaker.role(project.id, users.projectUser.id),
    ];
    role = roles[0];
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
    async (contributionVisibility, authUser, isContributionVisible) => {
      project.contributionVisibility = contributionVisibility;
      role.contribution = Contribution.from(1);
      const roleDto = await RoleDto.builder()
        .role(role)
        .project(project)
        .projectRoles(roles)
        .authUser(users[authUser])
        .build();
      expect(Boolean(roleDto.contribution)).toBe(isContributionVisible);
    },
  );

  test('should not show contribution if not project owner and if project not finished', async () => {
    project.contributionVisibility = ContributionVisibility.PUBLIC;
    project.state = ProjectState.PEER_REVIEW;
    role.contribution = Contribution.from(1);
    const roleDto = await RoleDto.builder()
      .role(role)
      .project(project)
      .projectRoles(roles)
      .authUser(users.assignee)
      .build();
    expect(roleDto.contribution).toBeFalsy();
  });

  const sentPeerReviewsCases: [string, boolean][] = [
    ['owner', true],
    ['assignee', true],
    ['projectUser', false],
    ['publicUser', false],
  ];

  test.each(sentPeerReviewsCases)(
    'sent peer reviews',
    async (authUser, areSentPeerReviewsVisible) => {
      const roleDto = await RoleDto.builder()
        .role(role)
        .project(project)
        .projectRoles(roles)
        .authUser(users[authUser])
        .addSubmittedPeerReviews(async () => [])
        .build();
      expect(Boolean(roleDto.submittedPeerReviews)).toBe(
        areSentPeerReviewsVisible,
      );
    },
  );

  const hasSubmittedPeerReviewsCases: [string, boolean][] = [
    ['owner', true],
    ['assignee', true],
    ['projectUser', false],
    ['publicUser', false],
  ];

  test.each(hasSubmittedPeerReviewsCases)(
    'has submitted peer reviews',
    async (authUser, isHasSubmittedPeerReviewsVisible) => {
      const roleDto = await RoleDto.builder()
        .role(role)
        .project(project)
        .projectRoles(roles)
        .authUser(users[authUser])
        .addSubmittedPeerReviews(async () => [])
        .build();
      expect(Boolean(roleDto.hasSubmittedPeerReviews)).toBe(
        isHasSubmittedPeerReviewsVisible,
      );
    },
  );
});