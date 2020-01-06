import { Test } from '@nestjs/testing';

import { UserEntity } from 'user';
import { ProjectEntity, ProjectState, ContributionVisibility } from 'project';
import { RoleEntity } from 'role/entities/role.entity';
import { RoleDtoBuilder } from 'role/dto/role.dto';
import { EntityFaker } from 'test';
import { TestModule } from 'test/test.module';

describe('role dto', () => {
  let entityFaker: EntityFaker;
  let users: Record<string, UserEntity>;
  let role: RoleEntity;
  let roles: RoleEntity[];
  let project: ProjectEntity;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();
    entityFaker = module.get(EntityFaker);
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
      const roleDto = await RoleDtoBuilder.of(role)
        .withProject(project)
        .withProjectRoles(roles)
        .withAuthUser(users[authUser])
        .build();
      expect(Boolean(roleDto.contribution)).toBe(isContributionVisible);
    },
  );

  test('should not show contribution if not project owner and if project not finished', async () => {
    project.contributionVisibility = ContributionVisibility.PUBLIC;
    project.state = ProjectState.PEER_REVIEW;
    role.contribution = 1;
    const roleDto = await RoleDtoBuilder.of(role)
      .withProject(project)
      .withProjectRoles(roles)
      .withAuthUser(users.assignee)
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
      const roleDto = await RoleDtoBuilder.of(role)
        .withProject(project)
        .withProjectRoles(roles)
        .withAuthUser(users[authUser])
        .addSentPeerReviews(async () => [])
        .build();
      expect(Boolean(roleDto.sentPeerReviews)).toBe(areSentPeerReviewsVisible);
    },
  );
});
