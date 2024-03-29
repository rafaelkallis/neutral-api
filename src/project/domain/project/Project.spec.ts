import td from 'testdouble';
import { User } from 'user/domain/User';
import { InternalProject, Project } from 'project/domain/project/Project';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { Role } from 'project/domain/role/Role';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { ModelFaker } from 'test/ModelFaker';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReadonlyReviewTopic } from '../review-topic/ReviewTopic';
import { ReviewTopicId } from '../review-topic/value-objects/ReviewTopicId';
import { ValueObjectFaker } from 'test/ValueObjectFaker';
import { PeerReviewCollection } from '../peer-review/PeerReviewCollection';
import { ProjectAnalyzer } from '../ProjectAnalyzer';

describe('' + Project.name, () => {
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
    const addedReviewTopic: ReadonlyReviewTopic = td.object();
    td.when(
      project.state.addReviewTopic(project, title, description, input),
    ).thenReturn(addedReviewTopic);
    const actualRole = project.addReviewTopic(title, description, input);
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
    project.finishFormation();
    td.verify(project.state.finishFormation(project));
  });

  test('submit peer reviews', async () => {
    const submittedPeerReviews: PeerReviewCollection = td.object();
    const projectAnalyzer: ProjectAnalyzer = td.object();

    await project.submitPeerReviews(submittedPeerReviews, projectAnalyzer);
    td.verify(
      project.state.submitPeerReviews(
        project,
        submittedPeerReviews,
        projectAnalyzer,
      ),
    );
  });

  test('complete peer reviews', async () => {
    const projectAnalyzer: ProjectAnalyzer = td.object();
    await project.completePeerReviews(projectAnalyzer);
    td.verify(project.state.completePeerReviews(project, projectAnalyzer));
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
