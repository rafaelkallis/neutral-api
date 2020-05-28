import { Id } from 'shared/domain/value-objects/Id';
import { ReadonlyAggregateRoot } from 'shared/domain/AggregateRoot';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class RepositoryStrategy<
  TId extends Id,
  TModel extends ReadonlyAggregateRoot<TId>
> {
  public abstract findPage(afterId?: TId): Promise<TModel[]>;
  public abstract findById(id: TId): Promise<TModel | undefined>;
  public abstract findByIds(ids: TId[]): Promise<(TModel | undefined)[]>;
  public abstract exists(id: TId): Promise<boolean>;
  public abstract persist(...models: TModel[]): Promise<void>;
}
