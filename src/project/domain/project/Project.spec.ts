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

  test('finish formation', () => {
    project.finishFormation();
    td.verify(project.state.finishFormation(project));
  });

  test('submit peer reviews', () => {
    const senderRoleId = RoleId.create();
    const submittedPeerReviews: [RoleId, PeerReviewScore][] = td.object();
    const contributionsComputer: ContributionsComputer = td.object();
    const consensualityComputer: ConsensualityComputer = td.object();

    project.submitPeerReviews(
      senderRoleId,
      submittedPeerReviews,
      contributionsComputer,
      consensualityComputer,
    );
    td.verify(
      project.state.submitPeerReviews(
        project,
        senderRoleId,
        submittedPeerReviews,
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
