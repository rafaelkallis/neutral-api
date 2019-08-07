import { Repository, FindConditions } from 'typeorm';

export class BaseRepository<T> extends Repository<T> {}
