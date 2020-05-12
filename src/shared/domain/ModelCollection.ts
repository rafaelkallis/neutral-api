import { Model, ReadonlyModel } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { InternalServerErrorException } from '@nestjs/common';

export interface ReadonlyModelCollection<
  TId extends Id,
  TModel extends ReadonlyModel<TId>
> extends Iterable<TModel> {
  contains(modelOrId: TModel | TId): boolean;
  assertContains(modelOrId: TModel | TId): void;
  findById(id: TId): TModel;
  toArray(): ReadonlyArray<TModel>;
  first(): TModel;
  isEmpty(): boolean;
}

export abstract class ModelCollection<TId extends Id, TModel extends Model<TId>>
  implements ReadonlyModelCollection<TId, TModel> {
  private models: TModel[];
  private readonly removedModels: TModel[];

  public constructor(models: ReadonlyArray<TModel>) {
    this.models = Array.from(models);
    this.removedModels = [];
  }

  public [Symbol.iterator](): Iterator<TModel> {
    return this.models[Symbol.iterator]();
  }

  public toArray(): ReadonlyArray<TModel> {
    return Array.from(this.models);
  }

  public first(): TModel {
    if (this.models.length === 0) {
      throw new InternalServerErrorException();
    }
    return this.models[0];
  }

  public add(modelToAdd: TModel): void {
    if (this.contains(modelToAdd.id)) {
      throw new Error('model already exists');
    }
    this.models.push(modelToAdd);
  }

  public addAll(modelsToAdd: Iterable<TModel>): void {
    for (const modelToAdd of modelsToAdd) {
      this.add(modelToAdd);
    }
  }

  public remove(modelToRemove: TModel): void {
    if (!this.contains(modelToRemove.id)) {
      throw new Error('model does not exist');
    }
    this.removedModels.push(modelToRemove);
    this.models = this.models.filter((model) => !model.equals(modelToRemove));
  }

  public removeAll(modelsToRemove: TModel[]): void {
    for (const modelToRemove of modelsToRemove) {
      this.remove(modelToRemove);
    }
  }

  public findById(id: TId): TModel {
    const model = this.models.find((model) => model.id.equals(id));
    if (!model) {
      throw new Error('model does not exist');
    }
    return model;
  }

  /**
   *
   */
  public contains(modelOrId: TModel | TId): boolean {
    const id = this.getId(modelOrId);
    return this.isAny((model) => model.id.equals(id));
  }

  public assertContains(modelOrId: TModel | TId): void {
    if (!this.contains(modelOrId)) {
      throw new Error(
        'assertion failed: collection does not contain given model',
      );
    }
  }

  /**
   *
   */
  public getRemovedModels(): ReadonlyArray<TModel> {
    return this.removedModels;
  }

  public isAny(predicate: (model: TModel) => boolean): boolean {
    return this.models.some(predicate);
  }

  public areAll(predicate: (model: TModel) => boolean): boolean {
    return this.models.every(predicate);
  }

  public isEmpty(): boolean {
    return this.models.length === 0;
  }

  protected getId<TId2 extends Id>(modelOrId: Model<TId2> | TId2): TId2 {
    return modelOrId instanceof Model ? modelOrId.id : modelOrId;
  }
}
