import { Inject } from '@nestjs/common';
import { Repository } from 'shared/domain/Repository';
import { Project } from 'project/domain/Project';
import { Id } from 'shared/domain/value-objects/Id';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

export function InjectProjectRepository(): ParameterDecorator {
  return Inject(PROJECT_REPOSITORY);
}

/**
 * Project Repository
 */
export interface ProjectRepository extends Repository<Project> {
  /**
   *
   */
  findByCreatorId(creatorId: Id): Promise<Project[]>;

  /**
   *
   */
  findByRoleId(roleId: Id): Promise<Project>;

  /**
   *
   */
  findByRoleAssigneeId(assigneeId: Id): Promise<Project[]>;
}
