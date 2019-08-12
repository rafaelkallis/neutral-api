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
  public async getRoles(): Promise<Role[]> {
    throw new NotImplementedException();
  }

  /**
   * Get the role with the given id
   */
  public async getRole(): Promise<Role> {
    throw new NotImplementedException();
  }

  /**
   * Create a role
   */
  public async createRole(): Promise<Role> {
    throw new NotImplementedException();
  }

  /**
   * Update a role
   */
  public async patchRole(): Promise<Role> {
    throw new NotImplementedException();
  }

  /**
   * Delete a role
   */
  public async deleteRole(): Promise<Role> {
    throw new NotImplementedException();
  }
}
