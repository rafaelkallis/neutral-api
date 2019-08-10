import { Controller, NotImplementedException } from '@nestjs/common';

import { Role } from '../common';

@Controller('roles')
export class RoleController {
  async getRoles(): Promise<Role[]> {
    throw new NotImplementedException();
  }

  async getRole(): Promise<Role> {
    throw new NotImplementedException();
  }

  async createRole(): Promise<Role> {
    throw new NotImplementedException();
  }

  async patchRole(): Promise<Role> {
    throw new NotImplementedException();
  }

  async deleteRole(): Promise<Role> {
    throw new NotImplementedException();
  }
}
