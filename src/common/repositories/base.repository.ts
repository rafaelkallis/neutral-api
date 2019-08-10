import { Repository } from 'typeorm';

/**
 * Base Repository
 */
export class BaseRepository<T> extends Repository<T> {}
