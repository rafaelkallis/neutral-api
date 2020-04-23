import { Model } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';

/**
 *
 */
export abstract class AggregateRoot<TId extends Id> extends Model<TId> {}
