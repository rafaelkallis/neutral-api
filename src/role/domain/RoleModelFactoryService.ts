import { ModelFactoryService } from 'common/domain/ModelFactoryService';
import { RoleModel } from 'role/domain/RoleModel';
import { Id } from 'common/domain/value-objects/Id';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';

export interface CreateRoleOptions {
  projectId: Id;
  title: string;
  description: string;
}

export class RoleModelFactoryService extends ModelFactoryService {
  /**
   *
   */
  public createRole(roleOptions: CreateRoleOptions): RoleModel {
    const roleId = Id.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const { projectId, title, description } = roleOptions;
    const assigneeId = null;
    const contribution = null;
    const hasSubmittedPeerReviews = false;
    return new RoleModel(
      roleId,
      createdAt,
      updatedAt,
      projectId,
      assigneeId,
      title,
      description,
      contribution,
      hasSubmittedPeerReviews,
    );
  }
}
