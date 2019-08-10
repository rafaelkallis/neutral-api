import { EntityRepository } from 'typeorm';

import { User } from '../entities/user.entity';

import { BaseRepository } from './base.repository';

/**
 * User Repository
 */
@EntityRepository(User)
export class UserRepository extends BaseRepository<User> {}
