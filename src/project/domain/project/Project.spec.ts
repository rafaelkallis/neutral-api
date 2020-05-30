import td from 'testdouble';
import { User } from 'user/domain/User';
import { Project } from 'project/domain/project/Project';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { Role } from 'project/domain/role/Role';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { ModelFaker } from 'test/ModelFaker';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { ReadonlyReviewTopic } from '../review-topic/ReviewTopic';
import { ReviewTopicId } from '../review-topic/value-objects/ReviewTopicId';
import { ReadonlyUserCollection } from 'user/domain/UserCollection';
import { CliquismComputer } from '../CliquismComputer';

describe(Project.name, () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;

  let creator: User;
  let project: Project;

  beforeEach(() => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();

    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
    project.state = td.object();
  });

  test('update project', () => {
    const title = ProjectTitle.from(primitiveFaker.words());
    project.update(title);
    td.verify(project.state.update(project, title, undefined));
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
    const title = ReviewTopicTitle.from(primitiveFaker.words());
    const description = ReviewTopicDescription.from(primitiveFaker.paragraph());
    const addedReviewTopic: ReadonlyReviewTopic = td.object();
    td.when(
      project.state.addReviewTopic(project, title, description),
    ).thenReturn(addedReviewTopic);
    const actualRole = project.addReviewTopic(title, description);
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
    const senderRoleId = RoleId.create();
    const reviewTopicId = ReviewTopicId.create();
    const submittedPeerReviews: [RoleId, PeerReviewScore][] = td.object();
    const contributionsComputer: ContributionsComputer = td.object();
    const consensualityComputer: ConsensualityComputer = td.object();
    const cliquismComputer: CliquismComputer = td.object();

    project.submitPeerReviews(
      senderRoleId,
      reviewTopicId,
      submittedPeerReviews,
      contributionsComputer,
      consensualityComputer,
      cliquismComputer,
    );
    td.verify(
      project.state.submitPeerReviews(
        project,
        senderRoleId,
        reviewTopicId,
        submittedPeerReviews,
        contributionsComputer,
        consensualityComputer,
        cliquismComputer,
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
