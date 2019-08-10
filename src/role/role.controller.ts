import { Controller, NotImplementedException } from '@nestjs/common';

import { Role } from '../common';

/**
 * Role Controller
 */
@Controller('roles')
export class RoleController {
  /**
   * Get roles of a particular project
   */
  async getRoles(): Promise<Role[]> {
    throw new NotImplementedException();
  }

  /**
   * Get the role with the given id
   */
  async getRole(): Promise<Role> {
    throw new NotImplementedException();
  }

  /**
   * Create a role
   */
  async createRole(): Promise<Role> {
    throw new NotImplementedException();
  }

  /**
   * Update a role
   */
  async patchRole(): Promise<Role> {
    throw new NotImplementedException();
  }

  /**
   * Delete a role
   */
  async deleteRole(): Promise<Role> {
    throw new NotImplementedException();
  }
}
