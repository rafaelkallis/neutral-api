import td from 'testdouble';
import { User } from 'user/domain/User';
import { Project, CreateProjectOptions } from 'project/domain/Project';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';
import { ProjectCreatedEvent } from 'project/domain/events/ProjectCreatedEvent';
import { ProjectFormationStartedEvent } from 'project/domain/events/ProjectFormationStartedEvent';
import { Role } from 'project/domain/Role';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { RoleTitle } from 'project/domain/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/value-objects/RoleDescription';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';
import { ModelFaker } from 'test/ModelFaker';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { UserId } from 'user/domain/value-objects/UserId';
import { RoleId } from 'project/domain/value-objects/RoleId';
import { ProjectPeerReview } from 'project/domain/value-objects/states/ProjectPeerReview';
import { ProjectManagerReview } from 'project/domain/value-objects/states/ProjectManagerReview';
import { ProjectFinished } from 'project/domain/value-objects/states/ProjectFinished';

describe(Project.name, () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;

  let creator: User;
  let project: Project;
  let roles: Role[];

  beforeEach(() => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();

    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
    roles = [
      modelFaker.role(project.id, creator.id),
      modelFaker.role(project.id),
      modelFaker.role(project.id),
      modelFaker.role(project.id),
    ];
    project.roles.addAll(roles);
  });

  describe('create project', () => {
    let title: ProjectTitle;
    let description: ProjectDescription;
    let createProjectOptions: CreateProjectOptions;

    beforeEach(() => {
      title = ProjectTitle.from(primitiveFaker.words());
      description = ProjectDescription.from(primitiveFaker.paragraph());
      createProjectOptions = { title, description, creator };
    });

    test('happy path', () => {
      const createdProject = Project.create(createProjectOptions);
      expect(createdProject.domainEvents).toEqual([
        expect.any(ProjectCreatedEvent),
        expect.any(ProjectFormationStartedEvent),
      ]);
    });
  });

  test('update project', () => {
    const title = ProjectTitle.from(primitiveFaker.words());
    project.state = td.object();
    project.update(title);
    td.verify(project.state.update(project, title, undefined));
  });

  test('archive project', () => {
    project.state = td.object();
    project.archive();
    td.verify(project.state.archive(project));
  });

  test('add role', () => {
    const title = RoleTitle.from(primitiveFaker.words());
    const description = RoleDescription.from(primitiveFaker.paragraph());
    const addedRole: Role = td.object();
    project.state = td.object();
    td.when(project.state.addRole(project, title, description)).thenReturn(
      addedRole,
    );
    const actualRole = project.addRole(title, description);
    expect(actualRole).toBe(addedRole);
  });

  test('update role', () => {
    const title = RoleTitle.from(primitiveFaker.words());
    const roleToUpdate = roles[0];
    project.state = td.object();
    project.updateRole(roleToUpdate.id, title);
    td.verify(
      project.state.updateRole(project, roleToUpdate.id, title, undefined),
    );
  });

  test('remove role', () => {
    const roleToRemove = roles[0];
    project.state = td.object();
    project.removeRole(roleToRemove.id);
    td.verify(project.state.removeRole(project, roleToRemove.id));
  });

  test('assign user to role', () => {
    const userToAssign = modelFaker.user();
    const roleToBeAssigned = roles[0];
    project.state = td.object();
    project.assignUserToRole(userToAssign, roleToBeAssigned.id);
    td.verify(
      project.state.assignUserToRole(
        project,
        userToAssign,
        roleToBeAssigned.id,
      ),
    );
  });

  test('unassign', () => {
    const roleToUnassign = roles[0];
    roleToUnassign.assigneeId = UserId.create();
    project.state = td.object();
    project.unassign(roleToUnassign.id);
    td.verify(project.state.unassign(project, roleToUnassign.id));
  });

  test('finish formation', () => {
    project.state = td.object();
    project.finishFormation();
    td.verify(project.state.finishFormation(project));
  });

  test('submit peer reviews', () => {
    project.state = td.object();
    const submittedPeerReviews: [RoleId, PeerReviewScore][] = td.object();
    const contributionsComputer: ContributionsComputer = td.object();
    const consensualityComputer: ConsensualityComputer = td.object();

    project.submitPeerReviews(
      roles[0].id,
      submittedPeerReviews,
      contributionsComputer,
      consensualityComputer,
    );
    td.verify(
      project.state.submitPeerReviews(
        project,
        roles[0].id,
        submittedPeerReviews,
        contributionsComputer,
        consensualityComputer,
      ),
    );
  });

  describe('submit manager review', () => {
    beforeEach(() => {
      project.state = ProjectManagerReview.INSTANCE;
    });

    test('happy path', () => {
      project.submitManagerReview();
      expect(project.state).toBe(ProjectFinished.INSTANCE);
    });

    test('should fail if project is not in manager-review state', () => {
      project.state = ProjectPeerReview.INSTANCE;
      expect(() => project.submitManagerReview()).toThrow();
    });
  });
});
