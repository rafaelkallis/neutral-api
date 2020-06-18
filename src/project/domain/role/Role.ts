import { Model, ReadonlyModel } from 'shared/domain/Model';
import { ReadonlyUser } from 'user/domain/User';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { RoleNoUserAssignedException } from 'project/domain/exceptions/RoleNoUserAssignedException';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { UserId } from 'user/domain/value-objects/UserId';
import { Class } from 'shared/domain/Class';

export interface ReadonlyRole extends ReadonlyModel<RoleId> {
  readonly assigneeId: UserId | null;
  readonly title: RoleTitle;
  readonly description: RoleDescription;
}

/**
 * Role
 */
export class Role extends Model<RoleId> implements ReadonlyRole {
  public assigneeId: UserId | null;
  public title: RoleTitle;
  public description: RoleDescription;

  public constructor(
    id: RoleId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    assigneeId: UserId | null,
    title: RoleTitle,
    description: RoleDescription,
  ) {
    super(id, createdAt, updatedAt);
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
  }

  /**
   *
   */
  public static from(title: RoleTitle, description: RoleDescription): Role {
    const id = RoleId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const assigneeId = null;
    return new Role(id, createdAt, updatedAt, assigneeId, title, description);
  }

  public isAssigned(): boolean {
    return Boolean(this.assigneeId);
  }

  public assertAssigned(): UserId {
    if (!this.assigneeId) {
      throw new RoleNoUserAssignedException();
    }
    return this.assigneeId;
  }

  public isAssignedToUser(userOrUserId: ReadonlyUser | UserId): boolean {
    const userId =
      userOrUserId instanceof UserId ? userOrUserId : userOrUserId.id;
    return this.assigneeId ? this.assigneeId.equals(userId) : false;
  }

  public getClass(): Class<Role> {
    return Role;
  }
}
