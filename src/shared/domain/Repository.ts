import { Id } from 'shared/domain/value-objects/Id';
import { ReadonlyAggregateRoot } from 'shared/domain/AggregateRoot';
import { Injectable } from '@nestjs/common';
import { UnitOfWork } from 'shared/unit-of-work/domain/UnitOfWork';
import { RepositoryStrategy } from 'shared/domain/RepositoryStrategy';

@Injectable()
export abstract class Repository<
  TId extends Id,
  TModel extends ReadonlyAggregateRoot<TId>
> extends RepositoryStrategy<TId, TModel> {
  protected readonly unitOfWork: UnitOfWork;
  protected readonly strategy: RepositoryStrategy<TId, TModel>;

  public constructor(
    unitOfWork: UnitOfWork,
    strategy: RepositoryStrategy<TId, TModel>,
  ) {
    super();
    this.unitOfWork = unitOfWork;
    this.strategy = strategy;
  }

  /**
   *
   */
  public async findPage(afterId?: TId): Promise<TModel[]> {
    const models = await this.strategy.findPage(afterId);
    this.loadedModels(models);
    return models;
  }

  /**
   *
   */
  public async findById(id: TId): Promise<TModel | undefined> {
    const model = await this.strategy.findById(id);
    if (model) {
      this.loadedModel(model);
    }
    return model;
  }

  /**
   *
   */
  public async findByIds(ids: TId[]): Promise<(TModel | undefined)[]> {
    const models = await this.strategy.findByIds(ids);
    this.loadedModels(
      models.filter((model) => model !== undefined) as TModel[],
    );
    return models;
  }

  /**
   *
   */
  public async exists(id: TId): Promise<boolean> {
    return this.strategy.exists(id);
  }

  /**
   *
   */
  public async persist(...models: TModel[]): Promise<void> {
    await this.strategy.persist(...models);
  }

  protected loadedModel(model: TModel): void {
    this.unitOfWork.registerRead(model);
  }

  protected loadedModels(models: TModel[]): void {
    for (const model of models) {
      this.loadedModel(model);
    }
  }
}
