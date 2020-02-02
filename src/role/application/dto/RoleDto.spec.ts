import { UserModel } from 'user';
import { ProjectModel, ProjectState, ContributionVisibility } from 'project';
import { RoleModel } from 'role/domain/RoleModel';
import { RoleDto } from 'role/application/dto/RoleDto';
import { EntityFaker } from 'test';

describe('role dto', () => {
  let entityFaker: EntityFaker;
  let users: Record<string, UserModel>;
  let role: RoleModel;
  let roles: RoleModel[];
  let project: ProjectModel;

  beforeEach(async () => {
    entityFaker = new EntityFaker();
    users = {
      owner: entityFaker.user(),
      assignee: entityFaker.user(),
      projectUser: entityFaker.user(),
      publicUser: entityFaker.user(),
    };
    project = entityFaker.project(users.owner.id);
    project.state = ProjectState.FINISHED;
    roles = [
      entityFaker.role(project.id, users.assignee.id),
      entityFaker.role(project.id, users.projectUser.id),
    ];
    role = roles[0];
    role.hasSubmittedPeerReviews = true;
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
      role.contribution = 1;
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
    role.contribution = 1;
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
