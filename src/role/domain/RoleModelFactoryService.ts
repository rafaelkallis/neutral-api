import { ModelFactoryService } from 'common/domain/ModelFactoryService';
import { RoleModel } from 'role/domain/RoleModel';

export interface CreateRoleOptions {
  projectId: string;
  title: string;
  description: string;
}

export class RoleModelFactoryService extends ModelFactoryService {
  /**
   *
   */
  public createRole(roleOptions: CreateRoleOptions): RoleModel {
    const roleId = this.createId();
    const createdAt = Date.now();
    const updatedAt = Date.now();
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
