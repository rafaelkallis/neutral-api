import { User } from 'user/domain/User';
import { Project } from 'project/domain/project/Project';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectUpdatedEvent } from 'project/domain/events/ProjectUpdatedEvent';
import { ProjectFormationFinishedEvent } from 'project/domain/events/ProjectFormationFinishedEvent';
import { ProjectPeerReviewStartedEvent } from 'project/domain/events/ProjectPeerReviewStartedEvent';
import { RoleCreatedEvent } from 'project/domain/events/RoleCreatedEvent';
import { Role } from 'project/domain/role/Role';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { ModelFaker } from 'test/ModelFaker';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { UserId } from 'user/domain/value-objects/UserId';
import { UserAssignedEvent } from 'project/domain/events/UserAssignedEvent';
import { UserUnassignedEvent } from 'project/domain/events/UserUnassignedEvent';
import { ProjectFormation } from 'project/domain/project/value-objects/states/ProjectFormation';
import { ProjectState } from 'project/domain/project/value-objects/states/ProjectState';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { ReviewTopicCreatedEvent } from 'project/domain/events/ReviewTopicCreatedEvent';

describe(ProjectFormation.name, () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;

  let state: ProjectState;
  let creator: User;
  let project: Project;
  let roles: Role[];

  beforeEach(() => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();

    state = ProjectFormation.INSTANCE;
    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
    roles = [
      modelFaker.role(creator.id),
      modelFaker.role(),
      modelFaker.role(),
      modelFaker.role(),
    ];
    project.roles.addAll(roles);
  });

  describe('update', () => {
    let title: ProjectTitle;

    beforeEach(() => {
      title = ProjectTitle.from(primitiveFaker.words());
    });

    test('happy path', () => {
      state.update(project, title);
      expect(project.domainEvents).toContainEqual(
        expect.any(ProjectUpdatedEvent),
      );
    });
  });

  describe('add role', () => {
    let title: RoleTitle;
    let description: RoleDescription;

    beforeEach(() => {
      title = RoleTitle.from(primitiveFaker.words());
      description = RoleDescription.from(primitiveFaker.paragraph());
    });

    test('happy path', () => {
      const addedRole = state.addRole(project, title, description);
      expect(project.roles.contains(addedRole.id)).toBeTruthy();
      expect(project.domainEvents).toContainEqual(expect.any(RoleCreatedEvent));
    });
  });

  describe('update role', () => {
    let title: RoleTitle;
    let roleToUpdate: Role;

    beforeEach(() => {
      title = RoleTitle.from(primitiveFaker.words());
      roleToUpdate = roles[0];
    });

    test('happy path', () => {
      state.updateRole(project, roleToUpdate.id, title);
      expect(roleToUpdate.title).toEqual(title);
    });
  });

  describe('remove role', () => {
    let roleToRemove: Role;

    beforeEach(() => {
      roleToRemove = roles[0];
    });

    test('happy path', () => {
      state.removeRole(project, roleToRemove.id);
      expect(project.roles.contains(roleToRemove.id)).toBeFalsy();
    });
  });

  describe('assign user to role', () => {
    let userToAssign: User;
    let roleToBeAssigned: Role;

    beforeEach(() => {
      userToAssign = modelFaker.user();
      roleToBeAssigned = roles[0];
    });

    test('happy path', () => {
      state.assignUserToRole(project, userToAssign, roleToBeAssigned.id);
      expect(roleToBeAssigned.assigneeId?.equals(userToAssign.id)).toBeTruthy();
      expect(project.domainEvents).toContainEqual(
        expect.any(UserAssignedEvent),
      );
    });

    test('when another user is already assigned, should unassign other user', () => {
      roleToBeAssigned.assigneeId = UserId.create();
      state.assignUserToRole(project, userToAssign, roleToBeAssigned.id);
      expect(roleToBeAssigned.assigneeId?.equals(userToAssign.id)).toBeTruthy();
      expect(project.domainEvents).toContainEqual(
        expect.any(UserUnassignedEvent),
      );
    });

    test('when user is already assigned to another role, should unassign other role', () => {
      const currentAssignedRole = roles[1];
      state.assignUserToRole(project, userToAssign, currentAssignedRole.id);
      state.assignUserToRole(project, userToAssign, roleToBeAssigned.id);
      expect(currentAssignedRole.assigneeId).toBeNull();
      expect(roleToBeAssigned.assigneeId?.equals(userToAssign.id)).toBeTruthy();
      expect(project.domainEvents).toContainEqual(
        expect.any(UserAssignedEvent),
      );
      expect(project.domainEvents).toContainEqual(
        expect.any(UserUnassignedEvent),
      );
    });
  });

  describe('unassign', () => {
    let roleToUnassign: Role;

    beforeEach(() => {
      roleToUnassign = roles[0];
      roleToUnassign.assigneeId = UserId.create();
    });

    test('happy path', () => {
      state.unassign(project, roleToUnassign.id);
      expect(roleToUnassign.assigneeId).toBeNull();
      expect(project.domainEvents).toContainEqual(
        expect.any(UserUnassignedEvent),
      );
    });

    test('when no user is assigned, should fail', () => {
      roleToUnassign.assigneeId = null;
      expect(() => state.unassign(project, roleToUnassign.id)).toThrow();
    });
  });

  describe('add review topic', () => {
    let title: ReviewTopicTitle;
    let description: ReviewTopicDescription;

    beforeEach(() => {
      title = ReviewTopicTitle.from(primitiveFaker.words());
      description = ReviewTopicDescription.from(primitiveFaker.paragraph());
    });

    test('happy path', () => {
      const addedReviewTopic = state.addReviewTopic(
        project,
        title,
        description,
      );
      expect(project.reviewTopics.contains(addedReviewTopic.id)).toBeTruthy();
      expect(project.domainEvents).toContainEqual(
        expect.any(ReviewTopicCreatedEvent),
      );
    });
  });

  describe('finish formation', () => {
    beforeEach(() => {
      for (const role of project.roles) {
        role.assigneeId = UserId.create();
      }
    });

    test('happy path', () => {
      state.finishFormation(project);
      expect(project.domainEvents).toEqual([
        expect.any(ProjectFormationFinishedEvent),
        expect.any(ProjectPeerReviewStartedEvent),
      ]);
    });

    test('should fail if a role has no user assigned', () => {
      roles[0].assigneeId = null;
      expect(() => project.finishFormation()).toThrow();
    });

    test('should fail if amount of roles is insufficient', () => {
      project.roles.remove(roles[0]);
      expect(() => project.finishFormation()).toThrow();
    });
  });
});
