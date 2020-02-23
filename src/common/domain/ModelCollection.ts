import { Model } from 'common/domain/Model';
import { Id } from 'common/domain/value-objects/Id';

export class ModelCollection<TModel extends Model> {
  private readonly models: TModel[];
  private readonly removedModels: TModel[];

  public constructor(models: ReadonlyArray<TModel>) {
    this.models = Array.from(models);
    this.removedModels = [];
  }

  public add(...modelsToAdd: TModel[]): void {
    for (const modelToAdd of modelsToAdd) {
      if (this.exists(modelToAdd.id)) {
        throw new Error('model already exists');
      }
      this.models.push(modelToAdd);
    }
  }

  public remove(...modelsToRemove: TModel[]): void {
    for (const modelToRemove of modelsToRemove) {
      if (!this.exists(modelToRemove.id)) {
        throw new Error('model does not exist');
      }
      this.removedModels.push(modelToRemove);
      const modelToRemoveIndex = this.indexOf(modelToRemove.id);
      this.models.splice(modelToRemoveIndex, 1);
    }
  }

  public find(id: Id): TModel {
    if (!this.exists(id)) {
      throw new Error('model does not exist');
    }
    const modelIndex = this.indexOf(id);
    return this.models[modelIndex];
  }

  public [Symbol.iterator](): Iterator<TModel> {
    return this.toArray()[Symbol.iterator]();
  }

  public toArray(): ReadonlyArray<TModel> {
    return this.models;
  }

  /**
   *
   */
  public exists(id: Id): boolean {
    return this.indexOf(id) !== -1;
  }

  /**
   *
   */
  public getRemovedModels(): ReadonlyArray<TModel> {
    return this.removedModels;
  }

  /**
   *
   */
  protected indexOf(id: Id): number {
    for (let i = 0; i < this.models.length; i++) {
      if (this.models[i].id.equals(id)) {
        return i;
      }
    }
    return -1;
  }
}
