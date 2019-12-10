import { EntityRepository } from 'typeorm';

import { RoleEntity } from '../entities/role.entity';

import { BaseRepository } from '../../common/repositories/base.repository';

/**
 * Role Repository
 */
@EntityRepository(RoleEntity)
export class RoleRepository extends BaseRepository<RoleEntity> {}
