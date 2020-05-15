import { Model, ReadonlyModel } from 'shared/domain/Model';
import { ReadonlyUser } from 'user/domain/User';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { RoleNoUserAssignedException } from 'project/domain/exceptions/RoleNoUserAssignedException';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { UserId } from 'user/domain/value-objects/UserId';
import { UnitOfWork } from 'shared/domain/unit-of-work/UnitOfWork';

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
    unitOfWork: UnitOfWork,
    id: RoleId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    assigneeId: UserId | null,
    title: RoleTitle,
    description: RoleDescription,
  ) {
    super(unitOfWork, id, createdAt, updatedAt);
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
  }

  /**
   *
   */
  public static from(
    unitOfWork: UnitOfWork,
    title: RoleTitle,
    description: RoleDescription,
  ): Role {
    const id = RoleId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const assigneeId = null;
    return new Role(
      unitOfWork,
      id,
      createdAt,
      updatedAt,
      assigneeId,
      title,
      description,
    );
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
}
