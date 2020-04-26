import { InvalidProjectStateException } from 'project/domain/exceptions/InvalidProjectStateException';
import { EnumValueObject } from 'shared/domain/value-objects/EnumValueObject';
import { ValueObject } from 'shared/domain/value-objects/ValueObject';
import { OperationNotSupportedByCurrentProjectStateException } from 'project/domain/exceptions/OperationNotSupportedByCurrentProjectStateException';
import { Project } from 'project/domain/Project';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';
import { RoleId } from 'project/domain/value-objects/RoleId';
import { RoleTitle } from 'project/domain/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/value-objects/RoleDescription';
import { Role } from 'project/domain/Role';
import { ReadonlyUser } from 'user/domain/User';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { ProjectStateValue } from 'project/domain/value-objects/states/ProjectStateValue';

/**
 *
 */
export abstract class ProjectState extends EnumValueObject<ProjectStateValue> {
  public update(
    project: Project,
    title?: ProjectTitle,
    description?: ProjectDescription,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public addRole(
    project: Project,
    title: RoleTitle,
    description: RoleDescription,
  ): Role {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public updateRole(
    project: Project,
    roleId: RoleId,
    title?: RoleTitle,
    description?: RoleDescription,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public removeRole(project: Project, roleId: RoleId): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public assignUserToRole(
    project: Project,
    userToAssign: ReadonlyUser,
    roleId: RoleId,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public unassign(project: Project, roleId: RoleId): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public finishFormation(project: Project): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public submitPeerReviews(
    project: Project,
    senderRoleId: RoleId,
    submittedPeerReviews: [RoleId, PeerReviewScore][],
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public submitManagerReview(project: Project): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public archive(project: Project): void {
    throw new OperationNotSupportedByCurrentProjectStateException();
  }

  public equals(other: ValueObject): boolean {
    if (!(other instanceof ProjectState)) {
      return false;
    }
    return super.equals(other);
  }

  protected getEnumType(): Record<string, string> {
    return ProjectStateValue;
  }

  protected throwInvalidValueObjectException(): never {
    throw new InvalidProjectStateException();
  }
}
