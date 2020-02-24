import { Role } from 'project/domain/Role';
import { RoleNotFoundException } from 'project/domain/exceptions/RoleNotFoundException';
import { Id } from 'common/domain/value-objects/Id';
import { User } from 'user/domain/User';
import { ModelCollection } from 'common/domain/ModelCollection';
import { Contributions } from 'project/domain/ContributionsComputer';
import { RoleNoUserAssignedException } from 'project/domain/exceptions/RoleNoUserAssignedException';

export class RoleCollection extends ModelCollection<Role> {
  public static empty(): RoleCollection {
    return new RoleCollection([]);
  }

  public findByAssignee(assigneeOrAssigneeId: User | Id): Role {
    for (const role of this) {
      if (role.isAssignedToUser(assigneeOrAssigneeId)) {
        return role;
      }
    }
    throw new RoleNotFoundException();
  }

  public excluding(roleToExclude: Role): ReadonlyArray<Role> {
    if (!this.exists(roleToExclude.id)) {
      throw new RoleNotFoundException();
    }
    return this.toArray().filter(role => !role.equals(roleToExclude));
  }

  public applyContributions(contributions: Contributions): void {
    for (const role of this) {
      role.contribution = contributions.of(role.id);
    }
  }

  public anyAssignedToUser(userOrUserId: User | Id): boolean {
    return this.toArray().some(role => role.isAssignedToUser(userOrUserId));
  }

  public assertAllAreAssigned(): void {
    if (!this.toArray().every(role => role.isAssigned())) {
      throw new RoleNoUserAssignedException();
    }
  }

  public allHaveSubmittedPeerReviews(): boolean {
    return this.toArray().every(role => role.hasSubmittedPeerReviews.value);
  }
}
