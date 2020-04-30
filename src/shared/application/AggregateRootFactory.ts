import { Id } from 'shared/domain/value-objects/Id';
import { ReadonlyAggregateRoot } from 'shared/domain/AggregateRoot';

export abstract class AggregateRootFactory<
  TCreateOptions,
  TId extends Id,
  TModel extends ReadonlyAggregateRoot<TId>
> {
  public create(createOptions: TCreateOptions): TModel {
    const model = this.doCreate(createOptions);
    // perform extra configuration if needed
    return model;
  }

  protected abstract doCreate(createOptions: TCreateOptions): TModel;
}
