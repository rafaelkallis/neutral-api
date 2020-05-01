import { ProjectState } from 'project/domain/project/value-objects/states/ProjectState';
import { Project } from 'project/domain/project/Project';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/project/value-objects/ProjectDescription';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { ReadonlyRole } from 'project/domain/role/Role';
import { ReadonlyUser } from 'user/domain/User';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';

export abstract class ProjectStateDecorator extends ProjectState {
  protected readonly base: ProjectState;

  public constructor(base: ProjectState) {
    super();
    this.base = base;
  }

  public update(
    project: Project,
    title?: ProjectTitle | undefined,
    description?: ProjectDescription | undefined,
  ): void {
    this.base.update(project, title, description);
  }
  public addRole(
    project: Project,
    title: RoleTitle,
    description: RoleDescription,
  ): ReadonlyRole {
    return this.base.addRole(project, title, description);
  }
  public updateRole(
    project: Project,
    roleId: RoleId,
    title?: RoleTitle | undefined,
    description?: RoleDescription | undefined,
  ): void {
    this.base.updateRole(project, roleId, title, description);
  }
  public removeRole(project: Project, roleId: RoleId): void {
    this.base.removeRole(project, roleId);
  }
  public assignUserToRole(
    project: Project,
    userToAssign: ReadonlyUser,
    roleId: RoleId,
  ): void {
    this.base.assignUserToRole(project, userToAssign, roleId);
  }
  public unassign(project: Project, roleId: RoleId): void {
    this.base.unassign(project, roleId);
  }
  public finishFormation(project: Project): void {
    this.base.finishFormation(project);
  }
  public cancel(project: Project): void {
    this.base.cancel(project);
  }
  public submitPeerReviews(
    project: Project,
    senderRoleId: RoleId,
    submittedPeerReviews: [RoleId, PeerReviewScore][],
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void {
    this.base.submitPeerReviews(
      project,
      senderRoleId,
      submittedPeerReviews,
      contributionsComputer,
      consensualityComputer,
    );
  }
  public submitManagerReview(project: Project): void {
    this.base.submitManagerReview(project);
  }
  public archive(project: Project): void {
    this.base.archive(project);
  }
}