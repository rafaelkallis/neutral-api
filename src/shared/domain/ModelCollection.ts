import { Model, ReadonlyModel } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { FilterIterable } from 'shared/domain/FilterIterable';

export interface ReadonlyModelCollection<
  TId extends Id,
  TModel extends ReadonlyModel<TId>
> extends Iterable<TModel> {
  contains(modelOrId: TModel | TId): boolean;
  find(id: TId): TModel;
}

export abstract class ModelCollection<TId extends Id, TModel extends Model<TId>>
  implements ReadonlyModelCollection<TId, TModel> {
  private readonly models: TModel[];
  private readonly removedModels: TModel[];

  public constructor(models: ReadonlyArray<TModel>) {
    this.models = Array.from(models);
    this.removedModels = [];
  }

  public add(modelToAdd: TModel): void {
    if (this.contains(modelToAdd.id)) {
      throw new Error('model already exists');
    }
    this.models.push(modelToAdd);
  }

  public addAll(modelsToAdd: TModel[]): void {
    for (const modelToAdd of modelsToAdd) {
      this.add(modelToAdd);
    }
  }

  public remove(modelToRemove: TModel): void {
    if (!this.contains(modelToRemove.id)) {
      throw new Error('model does not exist');
    }
    this.removedModels.push(modelToRemove);
    const modelToRemoveIndex = this.indexOf(modelToRemove.id);
    this.models.splice(modelToRemoveIndex, 1);
  }

  public removeAll(modelsToRemove: TModel[]): void {
    for (const modelToRemove of modelsToRemove) {
      this.remove(modelToRemove);
    }
  }

  public find(id: TId): TModel {
    for (const model of this) {
      if (model.id.equals(id)) {
        return model;
      }
    }
    throw new Error('model does not exist');
  }

  public [Symbol.iterator](): Iterator<TModel> {
    return this.models[Symbol.iterator]();
  }

  public filter(predicate: (model: TModel) => boolean): Iterable<TModel> {
    return new FilterIterable(this, predicate);
  }

  /**
   *
   */
  public contains(modelOrId: TModel | TId): boolean {
    const id = this.getId(modelOrId);
    return this.isAny((model) => model.id.equals(id));
  }

  /**
   *
   */
  public getRemovedModels(): ReadonlyArray<TModel> {
    return this.removedModels;
  }

  protected isAny(predicate: (model: TModel) => boolean): boolean {
    for (const model of this) {
      if (predicate(model)) {
        return true;
      }
    }
    return false;
  }

  protected areAll(predicate: (model: TModel) => boolean): boolean {
    for (const model of this) {
      if (!predicate(model)) {
        return false;
      }
    }
    return true;
  }

  protected getId(modelOrId: TModel | TId): TId {
    return modelOrId instanceof Model ? modelOrId.id : modelOrId;
  }

  /**
   *
   */
  private indexOf(id: TId): number {
    for (let i = 0; i < this.models.length; i++) {
      if (this.models[i].id.equals(id)) {
        return i;
      }
    }
    return -1;
  }
}
