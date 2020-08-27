import td from 'testdouble';
import { User } from 'user/domain/User';
import { InternalProject, Project } from 'project/domain/project/Project';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { Role } from 'project/domain/role/Role';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { ModelFaker } from 'test/ModelFaker';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReadonlyReviewTopic } from '../review-topic/ReviewTopic';
import { ReviewTopicId } from '../review-topic/value-objects/ReviewTopicId';
import { ReadonlyUserCollection } from 'user/domain/UserCollection';
import { ValueObjectFaker } from 'test/ValueObjectFaker';
import { PeerReviewCollection } from '../peer-review/PeerReviewCollection';

describe(Project.name, () => {
  let primitiveFaker: PrimitiveFaker;
  let valueObjectFaker: ValueObjectFaker;
  let modelFaker: ModelFaker;

  let creator: User;
  let project: InternalProject;

  beforeEach(() => {
    primitiveFaker = new PrimitiveFaker();
    valueObjectFaker = new ValueObjectFaker(primitiveFaker);
    modelFaker = new ModelFaker(primitiveFaker);

    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
    project.state = td.object();
  });

  test('update project', () => {
    const title = ProjectTitle.from(primitiveFaker.words());
    project.update({ title });
    td.verify(project.state.update(project, { title }));
  });

  test('add role', () => {
    const title = RoleTitle.from(primitiveFaker.words());
    const description = RoleDescription.from(primitiveFaker.paragraph());
    const addedRole: Role = td.object();
    td.when(project.state.addRole(project, title, description)).thenReturn(
      addedRole,
    );
    const actualRole = project.addRole(title, description);
    expect(actualRole).toBe(addedRole);
  });

  test('update role', () => {
    const title = RoleTitle.from(primitiveFaker.words());
    const roleIdToUpdate = RoleId.create();
    project.updateRole(roleIdToUpdate, title);
    td.verify(
      project.state.updateRole(project, roleIdToUpdate, title, undefined),
    );
  });

  test('remove role', () => {
    const roleIdToRemove = RoleId.create();
    project.removeRole(roleIdToRemove);
    td.verify(project.state.removeRole(project, roleIdToRemove));
  });

  test('assign user to role', () => {
    const userToAssign: User = td.object();
    const roleIdToBeAssigned = RoleId.create();
    project.assignUserToRole(userToAssign, roleIdToBeAssigned);
    td.verify(
      project.state.assignUserToRole(project, userToAssign, roleIdToBeAssigned),
    );
  });

  test('unassign', () => {
    const roleIdToUnassign = RoleId.create();
    project.unassignRole(roleIdToUnassign);
    td.verify(project.state.unassign(project, roleIdToUnassign));
  });

  test('add review topic', () => {
    const title = valueObjectFaker.reviewTopic.title();
    const description = valueObjectFaker.reviewTopic.description();
    const input = valueObjectFaker.reviewTopic.input();
    const subjectType = valueObjectFaker.reviewTopic.subjectType();
    const addedReviewTopic: ReadonlyReviewTopic = td.object();
    td.when(
      project.state.addReviewTopic(
        project,
        title,
        description,
        input,
        subjectType,
      ),
    ).thenReturn(addedReviewTopic);
    const actualRole = project.addReviewTopic(
      title,
      description,
      input,
      subjectType,
    );
    expect(actualRole).toBe(addedReviewTopic);
  });

  test('update review topic', () => {
    const title = ReviewTopicTitle.from(primitiveFaker.words());
    const reviewTopicIdToUpdate = ReviewTopicId.create();
    project.updateReviewTopic(reviewTopicIdToUpdate, title);
    td.verify(
      project.state.updateReviewTopic(
        project,
        reviewTopicIdToUpdate,
        title,
        undefined,
        undefined,
      ),
    );
  });

  test('remove review topic', () => {
    const reviewTopicIdToRemove = ReviewTopicId.create();
    project.removeReviewTopic(reviewTopicIdToRemove);
    td.verify(project.state.removeReviewTopic(project, reviewTopicIdToRemove));
  });

  test('finish formation', () => {
    const assignees: ReadonlyUserCollection = td.object();
    project.finishFormation(assignees);
    td.verify(project.state.finishFormation(project, assignees));
  });

  test('submit peer reviews', () => {
    const submittedPeerReviews: PeerReviewCollection = td.object();
    const contributionsComputer: ContributionsComputer = td.object();
    const consensualityComputer: ConsensualityComputer = td.object();

    project.submitPeerReviews(
      submittedPeerReviews,
      contributionsComputer,
      consensualityComputer,
    );
    td.verify(
      project.state.submitPeerReviews(
        project,
        submittedPeerReviews,
        contributionsComputer,
        consensualityComputer,
      ),
    );
  });

  test('complete peer reviews', () => {
    const contributionsComputer: ContributionsComputer = td.object();
    const consensualityComputer: ConsensualityComputer = td.object();
    project.completePeerReviews(contributionsComputer, consensualityComputer);
    td.verify(
      project.state.completePeerReviews(
        project,
        contributionsComputer,
        consensualityComputer,
      ),
    );
  });

  test('submit manager review', () => {
    project.submitManagerReview();
    td.verify(project.state.submitManagerReview(project));
  });

  test('archive project', () => {
    project.archive();
    td.verify(project.state.archive(project));
  });
});
