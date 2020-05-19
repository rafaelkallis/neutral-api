import { Id } from 'shared/domain/value-objects/Id';
import { ReadonlyAggregateRoot } from 'shared/domain/AggregateRoot';
import { UnitOfWork } from 'shared/domain/unit-of-work/UnitOfWork';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class AggregateRootFactory<
  TCreateOptions,
  TId extends Id,
  TModel extends ReadonlyAggregateRoot<TId>
> {
  private readonly unitOfWork: UnitOfWork;

  public constructor(unitOfWork: UnitOfWork) {
    this.unitOfWork = unitOfWork;
  }

  public create(createOptions: TCreateOptions): TModel {
    const model = this.doCreate(createOptions);
    this.unitOfWork.registerNew(model);
    // perform extra configuration if needed
    return model;
  }

  protected abstract doCreate(createOptions: TCreateOptions): TModel;
}
