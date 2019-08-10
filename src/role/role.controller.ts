import { Controller, NotImplementedException } from '@nestjs/common';

import { Role } from '../common';

@Controller('roles')
export class RoleController {
  getRoles(): Promise<Role[]> {
    throw new NotImplementedException();
  }

  getRole(): Promise<Role> {
    throw new NotImplementedException();
  }

  createRole(): Promise<Role> {
    throw new NotImplementedException();
  }

  patchRole(): Promise<Role> {
    throw new NotImplementedException();
  }

  deleteRole(): Promise<Role> {
    throw new NotImplementedException();
  }
}
