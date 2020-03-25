import { Model } from 'common/domain/Model';
import { Id } from 'common/domain/value-objects/Id';
import { FilterIterable } from './FilterIterable';

export class ModelCollection<TModel extends Model> {
  private readonly models: TModel[];
  private readonly removedModels: TModel[];

  public constructor(models: ReadonlyArray<TModel>) {
    this.models = Array.from(models);
    this.removedModels = [];
  }

  public add(modelToAdd: TModel): void {
    if (this.exists(modelToAdd.id)) {
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
    if (!this.exists(modelToRemove.id)) {
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

  public find(id: Id): TModel {
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
  public exists(id: Id): boolean {
    return this.any(model => model.id.equals(id));
  }

  /**
   *
   */
  public getRemovedModels(): ReadonlyArray<TModel> {
    return this.removedModels;
  }

  protected any(predicate: (model: TModel) => boolean): boolean {
    for (const model of this) {
      if (predicate(model)) {
        return true;
      }
    }
    return false;
  }

  protected all(predicate: (model: TModel) => boolean): boolean {
    for (const model of this) {
      if (!predicate(model)) {
        return false;
      }
    }
    return true;
  }

  /**
   *
   */
  private indexOf(id: Id): number {
    for (let i = 0; i < this.models.length; i++) {
      if (this.models[i].id.equals(id)) {
        return i;
      }
    }
    return -1;
  }
}
