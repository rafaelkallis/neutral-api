import { Model, ReadonlyModel } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';

export interface ReadonlyAggregateRoot<TId extends Id>
  extends ReadonlyModel<TId> {}

/**
 *
 */
export abstract class AggregateRoot<TId extends Id> extends Model<TId> {}
