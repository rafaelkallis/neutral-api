import { Entity } from 'common';
import { Role } from 'role/role';
import { User } from 'user/user';

/**
 * Role Entity
 */
export interface RoleEntity extends Role, Entity {
  isAssignee(user: User): boolean;
  hasAssignee(): boolean;
}
