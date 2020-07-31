import { User } from 'user/domain/User';
import { Role } from 'project/domain/role/Role';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import { InternalProject } from 'project/domain/project/Project';
import { ContributionAmount } from 'project/domain/role/value-objects/ContributionAmount';
import { ModelFaker } from 'test/ModelFaker';
import { ContributionCollection } from 'project/domain/contribution/ContributionCollection';
import { Contribution } from 'project/domain/contribution/Contribution';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { RoleDtoMap } from './RoleDtoMap';

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

  test('should map', async () => {
    const roleDto = await roleDtoMap.map(role, {
      project,
      authUser: users.owner,
    });
    expect(roleDto).toEqual({
      id: role.id.value,
      createdAt: role.createdAt.value,
      updatedAt: role.updatedAt.value,
      projectId: project.id.value,
      title: role.title.value,
      description: role.description.value,
      assigneeId: role.assigneeId?.value,
    });
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
