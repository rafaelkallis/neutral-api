import { User } from 'user/domain/User';
import { Role } from 'project/domain/role/Role';
import { InternalProject } from 'project/domain/project/Project';
import { ModelFaker } from 'test/ModelFaker';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { RoleDtoMap } from './RoleDtoMap';
import { RoleMetricCollection } from 'project/domain/role-metric/RoleMetricCollection';
import { RoleMetric } from 'project/domain/role-metric/RoleMetric';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { Agreement } from 'project/domain/value-objects/Agreement';
import { Contribution } from 'project/domain/value-objects/Contribution';

describe('' + RoleDtoMap.name, () => {
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
    const milestone = modelFaker.milestone(project);
    project.milestones.add(milestone);
    project.roles.addAll([
      modelFaker.role(users.assignee.id),
      modelFaker.role(users.projectUser.id),
    ]);
    role = project.roles.whereAssignee(users.assignee);
    reviewTopic = modelFaker.reviewTopic();
    project.reviewTopics.add(reviewTopic);
    project.roleMetrics = new RoleMetricCollection([
      RoleMetric.create(
        project,
        role.id,
        reviewTopic.id,
        milestone.id,
        Contribution.of(1),
        Consensuality.of(1),
        Agreement.of(1),
      ),
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
      hasSubmittedPeerReviews: false,
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
