import { UserEntity } from 'user';
import { ProjectEntity, ProjectState, ContributionVisibility } from 'project';
import { RoleEntity } from 'role/entities/role.entity';
import { RoleDtoBuilder } from 'role/dto/role.dto';
import { entityFaker } from 'test';

describe('role dto', () => {
  const owner = entityFaker.user();
  const assignee = entityFaker.user();
  const projectUser = entityFaker.user();
  const publicUser = entityFaker.user();
  let role: RoleEntity;
  let roles: RoleEntity[];
  let project: ProjectEntity;

  beforeEach(() => {
    project = entityFaker.project(owner.id);
    project.state = ProjectState.FINISHED;
    roles = [
      entityFaker.role(project.id, assignee.id),
      entityFaker.role(project.id, projectUser.id),
    ];
    role = roles[0];
  });

  const { PUBLIC, PROJECT, SELF, NONE } = ContributionVisibility;
  const contributionCases: [ContributionVisibility, UserEntity, boolean][] = [
    [PUBLIC, owner, true],
    [PUBLIC, assignee, true],
    [PUBLIC, projectUser, true],
    [PUBLIC, publicUser, true],
    [PROJECT, owner, true],
    [PROJECT, assignee, true],
    [PROJECT, projectUser, true],
    [PROJECT, publicUser, false],
    [SELF, owner, true],
    [SELF, assignee, true],
    [SELF, projectUser, false],
    [SELF, publicUser, false],
    [NONE, owner, true],
    [NONE, assignee, false],
    [NONE, projectUser, false],
    [NONE, publicUser, false],
  ];

  test.each(contributionCases)(
    'contributions',
    async (contributionVisibility, authUser, isContributionVisible) => {
      project.contributionVisibility = contributionVisibility;
      role.contribution = 1;
      const roleDto = await new RoleDtoBuilder(
        role,
        project,
        roles,
        authUser,
      ).build();
      expect(Boolean(roleDto.contribution)).toBe(isContributionVisible);
    },
  );

  test('should not show contribution if not project owner and if project not finished', async () => {
    project.contributionVisibility = ContributionVisibility.PUBLIC;
    project.state = ProjectState.PEER_REVIEW;
    role.contribution = 1;
    const roleDto = await new RoleDtoBuilder(
      role,
      project,
      roles,
      assignee,
    ).build();
    expect(roleDto.contribution).toBeFalsy();
  });

  const sentPeerReviewsCases: [UserEntity, boolean][] = [
    [owner, true],
    [assignee, true],
    [projectUser, false],
    [publicUser, false],
  ];

  test.each(sentPeerReviewsCases)(
    'sent peer reviews',
    async (authUser, areSentPeerReviewsVisible) => {
      const roleDto = await new RoleDtoBuilder(role, project, roles, authUser)
        .addSentPeerReviews(async () => [])
        .build();
      expect(Boolean(roleDto.sentPeerReviews)).toBe(areSentPeerReviewsVisible);
    },
  );

  const receivedPeerReviewsCases: [UserEntity, boolean][] = [
    [owner, true],
    [assignee, false],
    [projectUser, false],
    [publicUser, false],
  ];

  test.each(receivedPeerReviewsCases)(
    'received peer reviews, ',
    async (authUser, areReceivedPeerReviewsVisible) => {
      const roleDto = await new RoleDtoBuilder(role, project, roles, authUser)
        .addReceivedPeerReviews(async () => [])
        .build();
      expect(Boolean(roleDto.receivedPeerReviews)).toBe(
        areReceivedPeerReviewsVisible,
      );
    },
  );
});
