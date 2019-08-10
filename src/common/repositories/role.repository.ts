import { EntityRepository } from 'typeorm';

import { Role } from '../entities/role.entity';

import { BaseRepository } from './base.repository';

/**
 * Role Repository
 */
@EntityRepository(Role)
export class RoleRepository extends BaseRepository<Role> {}
