import { Role, ReadonlyRole } from 'project/domain/role/Role';
import { RoleNotFoundException } from 'project/domain/exceptions/RoleNotFoundException';
import { ReadonlyUser } from 'user/domain/User';
import {
  ModelCollection,
  ReadonlyModelCollection,
} from 'shared/domain/ModelCollection';
import { RoleNoUserAssignedException } from 'project/domain/exceptions/RoleNoUserAssignedException';
import { SingleAssignmentPerUserViolationException } from 'project/domain/exceptions/SingleAssignmentPerUserViolationException';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { UserId } from 'user/domain/value-objects/UserId';
import { InsufficientRoleAmountException } from 'project/domain/exceptions/InsufficientRoleAmountException';

export interface ReadonlyRoleCollection
  extends ReadonlyModelCollection<RoleId, ReadonlyRole> {
  isAnyAssignedToUser(userOrUserId: ReadonlyUser | UserId): boolean;
  findByAssignee(assigneeOrAssigneeId: ReadonlyUser | UserId): ReadonlyRole;
  excluding(roleToExclude: ReadonlyRole): Iterable<ReadonlyRole>;
}

export class RoleCollection extends ModelCollection<RoleId, Role>
  implements ReadonlyRoleCollection {
  /**
   * Find role by assignee.
   * @param assigneeOrAssigneeId
   */
  public findByAssignee(assigneeOrAssigneeId: ReadonlyUser | UserId): Role {
    for (const role of this.toArray()) {
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
    return this.toArray().filter((role) => !role.equals(roleToExclude));
  }

  public isAnyAssignedToUser(userOrUserId: ReadonlyUser | UserId): boolean {
    return this.isAny((role) => role.isAssignedToUser(userOrUserId));
  }

  public assertSingleAssignmentPerUser(): void {
    const seenUsers: UserId[] = [];
    for (const role of this.toArray()) {
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
    if (!this.toArray().every((role) => role.isAssigned())) {
      throw new RoleNoUserAssignedException();
    }
  }

  public assertSufficientAmount(): void {
    if (this.toArray().length < 4) {
      throw new InsufficientRoleAmountException();
    }
  }

  public allHaveSubmittedPeerReviews(): boolean {
    return this.areAll((role) => role.hasSubmittedPeerReviews.value);
  }
}
