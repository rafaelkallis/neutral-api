import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { BaseRepository } from '../common';

@EntityRepository(User)
export class UserRepository extends BaseRepository<User> {}
