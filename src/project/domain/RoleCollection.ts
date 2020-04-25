import { Role } from 'project/domain/Role';
import { RoleNotFoundException } from 'project/domain/exceptions/RoleNotFoundException';
import { User } from 'user/domain/User';
import { ModelCollection } from 'shared/domain/ModelCollection';
import { Contributions } from 'project/domain/ContributionsComputer';
import { RoleNoUserAssignedException } from 'project/domain/exceptions/RoleNoUserAssignedException';
import { SingleAssignmentPerUserViolationException } from 'project/domain/exceptions/SingleAssignmentPerUserViolationException';
import { RoleId } from 'project/domain/value-objects/RoleId';
import { UserId } from 'user/domain/value-objects/UserId';
import { InsufficientRoleAmountException } from './exceptions/InsufficientRoleAmountException';

export class RoleCollection extends ModelCollection<RoleId, Role> {
  public static empty(): RoleCollection {
    return new RoleCollection([]);
  }

  /**
   * Find role by assignee.
   * @param assigneeOrAssigneeId
   */
  public findByAssignee(assigneeOrAssigneeId: User | UserId): Role {
    for (const role of this) {
      if (role.isAssignedToUser(assigneeOrAssigneeId)) {
        return role;
      }
    }
    throw new RoleNotFoundException();
  }

  public excluding(roleToExclude: Role): Iterable<Role> {
    if (!this.contains(roleToExclude.id)) {
      throw new RoleNotFoundException();
    }
    return this.filter((role) => !role.equals(roleToExclude));
  }

  public applyContributions(contributions: Contributions): void {
    for (const role of this) {
      role.contribution = contributions.of(role.id);
    }
  }

  public isAnyAssignedToUser(userOrUserId: User | UserId): boolean {
    return this.isAny((role) => role.isAssignedToUser(userOrUserId));
  }

  public assertSingleAssignmentPerUser(): void {
    const seenUsers: UserId[] = [];
    for (const role of this) {
      if (role.assigneeId) {
        for (const seenUser of seenUsers) {
          if (role.isAssignedToUser(seenUser)) {
            throw new SingleAssignmentPerUserViolationException();
          }
        }
        seenUsers.push(role.assigneeId);
      }
    }
  }

  public assertAllAreAssigned(): void {
    for (const role of this) {
      if (!role.isAssigned()) {
        throw new RoleNoUserAssignedException();
      }
    }
  }

  public assertSufficientAmount(): void {
    if (Array.from(this).length < 4) {
      throw new InsufficientRoleAmountException();
    }
  }

  public allHaveSubmittedPeerReviews(): boolean {
    return this.areAll((role) => role.hasSubmittedPeerReviews.value);
  }
}
