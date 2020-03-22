import { Role } from 'project/domain/Role';
import { RoleNotFoundException } from 'project/domain/exceptions/RoleNotFoundException';
import { Id } from 'common/domain/value-objects/Id';
import { User } from 'user/domain/User';
import { ModelCollection } from 'common/domain/ModelCollection';
import { Contributions } from 'project/domain/ContributionsComputer';
import { RoleNoUserAssignedException } from 'project/domain/exceptions/RoleNoUserAssignedException';
import { SingleAssignmentPerUserViolationException } from 'project/domain/exceptions/SingleAssignmentPerUserViolationException';

export class RoleCollection extends ModelCollection<Role> {
  public static empty(): RoleCollection {
    return new RoleCollection([]);
  }

  /**
   * Find role by assignee.
   * @param assigneeOrAssigneeId
   */
  public findByAssignee(assigneeOrAssigneeId: User | Id): Role {
    for (const role of this) {
      if (role.isAssignedToUser(assigneeOrAssigneeId)) {
        return role;
      }
    }
    throw new RoleNotFoundException();
  }

  public excluding(roleToExclude: Role): Iterable<Role> {
    if (!this.exists(roleToExclude.id)) {
      throw new RoleNotFoundException();
    }
    return this.filter(role => !role.equals(roleToExclude));
  }

  public applyContributions(contributions: Contributions): void {
    for (const role of this) {
      role.contribution = contributions.of(role.id);
    }
  }

  public anyAssignedToUser(userOrUserId: User | Id): boolean {
    return this.any(role => role.isAssignedToUser(userOrUserId));
  }

  public assertSingleAssignmentPerUser(): void {
    const seenUsers: Id[] = [];
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

  public allHaveSubmittedPeerReviews(): boolean {
    return this.all(role => role.hasSubmittedPeerReviews.value);
  }
}
