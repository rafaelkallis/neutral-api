import { ProjectState } from 'project/domain/value-objects/states/ProjectState';
import { ProjectStateValue } from 'project/domain/value-objects/states/ProjectStateValue';
import { Project } from 'project/domain/Project';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';
import { ProjectUpdatedEvent } from 'project/domain/events/ProjectUpdatedEvent';
import { ProjectArchivedEvent } from 'project/domain/events/ProjectArchivedEvent';
import { RoleTitle } from 'project/domain/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/value-objects/RoleDescription';
import { Role } from 'project/domain/Role';
import { RoleCreatedEvent } from 'project/domain/events/RoleCreatedEvent';
import { RoleId } from 'project/domain/value-objects/RoleId';
import { RoleUpdatedEvent } from 'project/domain/events/RoleUpdatedEvent';
import { RoleDeletedEvent } from 'project/domain/events/RoleDeletedEvent';
import { ReadonlyUser } from 'user/domain/User';
import { UserAssignedEvent } from 'project/domain/events/UserAssignedEvent';
import { UserId } from 'user/domain/value-objects/UserId';
import { UserUnassignedEvent } from 'project/domain/events/UserUnassignedEvent';
import { ProjectFormationFinishedEvent } from 'project/domain/events/ProjectFormationFinishedEvent';
import { ProjectPeerReviewStartedEvent } from 'project/domain/events/ProjectPeerReviewStartedEvent';
import { ProjectArchived } from 'project/domain/value-objects/states/ProjectArchived';
import { ProjectPeerReview } from 'project/domain/value-objects/states/ProjectPeerReview';

export class ProjectFormation extends ProjectState {
  private static readonly INSTANCE = new ProjectFormation();
  public static getInstance(): ProjectState {
    return ProjectFormation.INSTANCE;
  }

  private constructor() {
    super(ProjectStateValue.FORMATION);
  }
  public update(
    project: Project,
    title?: ProjectTitle,
    description?: ProjectDescription,
  ): void {
    if (title) {
      project.title = title;
    }
    if (description) {
      project.description = description;
    }
    project.raise(new ProjectUpdatedEvent(project));
  }

  public archive(project: Project): void {
    project.state = ProjectArchived.getInstance();
    project.raise(new ProjectArchivedEvent(project));
  }

  public addRole(
    project: Project,
    title: RoleTitle,
    description: RoleDescription,
  ): Role {
    const role = Role.from(project.id, title, description);
    project.roles.add(role);
    project.raise(new RoleCreatedEvent(project.id, role.id));
    return role;
  }

  public updateRole(
    project: Project,
    roleId: RoleId,
    title?: RoleTitle,
    description?: RoleDescription,
  ): void {
    const roleToUpdate = project.roles.find(roleId);
    if (title) {
      roleToUpdate.title = title;
    }
    if (description) {
      roleToUpdate.description = description;
    }
    if (title || description) {
      project.raise(new RoleUpdatedEvent(roleToUpdate));
    }
  }

  public removeRole(project: Project, roleId: RoleId): void {
    const roleToRemove = project.roles.find(roleId);
    project.roles.remove(roleToRemove);
    project.raise(new RoleDeletedEvent(roleToRemove));
  }

  public assignUserToRole(
    project: Project,
    userToAssign: ReadonlyUser,
    roleId: RoleId,
  ): void {
    const roleToBeAssigned = project.roles.find(roleId);
    if (roleToBeAssigned.isAssignedToUser(userToAssign)) {
      return;
    }
    if (roleToBeAssigned.isAssigned()) {
      project.unassign(roleToBeAssigned.id);
    }
    if (project.roles.isAnyAssignedToUser(userToAssign)) {
      const currentAssignedRole = project.roles.findByAssignee(userToAssign);
      project.unassign(currentAssignedRole.id);
    }
    roleToBeAssigned.assigneeId = userToAssign.id;
    project.roles.assertSingleAssignmentPerUser();
    project.raise(
      new UserAssignedEvent(project, roleToBeAssigned, userToAssign),
    );
  }

  public unassign(project: Project, roleId: RoleId): void {
    const role = project.roles.find(roleId);
    role.assertAssigned();
    const previousAssigneeId = role.assigneeId as UserId;
    role.assigneeId = null;
    project.raise(new UserUnassignedEvent(project, role, previousAssigneeId));
  }

  public finishFormation(project: Project): void {
    project.roles.assertSufficientAmount();
    project.roles.assertAllAreAssigned();
    project.state = ProjectPeerReview.getInstance();
    project.raise(new ProjectFormationFinishedEvent(project));
    project.raise(new ProjectPeerReviewStartedEvent(project));
  }
}
