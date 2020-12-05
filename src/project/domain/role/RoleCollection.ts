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
import { DomainException } from 'shared/domain/exceptions/DomainException';
import { Model } from 'shared/domain/Model';

export interface ReadonlyRoleCollection
  extends ReadonlyModelCollection<RoleId, ReadonlyRole> {
  isAnyAssignedToUser(userOrUserId: ReadonlyUser | UserId): boolean;
  /**
   * Find role by assignee.
   * @param assigneeOrAssigneeId
   */
  whereAssignee(assigneeOrAssigneeId: ReadonlyUser | UserId): ReadonlyRole;
  whereNot(roleOrIdToExclude: ReadonlyRole | RoleId): ReadonlyRoleCollection;
}

export class RoleCollection
  extends ModelCollection<RoleId, Role>
  implements ReadonlyRoleCollection {
  public whereAssignee(assigneeOrAssigneeId: ReadonlyUser | UserId): Role {
    for (const role of this.toArray()) {
      if (role.isAssignedToUser(assigneeOrAssigneeId)) {
        return role;
      }
    }
    throw new RoleNotFoundException();
  }

  public whereNot(
    roleOrIdToExclude: ReadonlyRole | RoleId,
  ): ReadonlyRoleCollection {
    const roleIdToExclude = Model.getId(roleOrIdToExclude);
    const roleToExclude = this.whereId(roleIdToExclude);
    this.assertContains(roleToExclude);
    return this.filter((role) => !role.equals(roleToExclude));
  }

  public isAnyAssignedToUser(userOrUserId: ReadonlyUser | UserId): boolean {
    return this.isAny((role) => role.isAssignedToUser(userOrUserId));
  }

  public assertUniqueAssignees(): void {
    const seenUsers: UserId[] = [];
    for (const role of this) {
      if (!role.assigneeId) {
        continue;
      }
      if (seenUsers.some((seenUser) => role.isAssignedToUser(seenUser))) {
        throw new SingleAssignmentPerUserViolationException();
      }
      seenUsers.push(role.assigneeId);
    }
  }

  public assertAllAreAssigned(): void {
    if (!this.areAll((role) => role.isAssigned())) {
      throw new RoleNoUserAssignedException();
    }
  }

  public assertSufficientAmount(): void {
    if (this.count() < 3) {
      throw new DomainException(
        'insufficient_role_amount',
        'Insufficient number of roles, at least 3 are required.',
      );
    }
  }

  protected filter(
    predicate: (role: ReadonlyRole) => boolean,
  ): ReadonlyRoleCollection {
    return new RoleCollection(this.toArray().filter(predicate));
  }
}
