import { Model, ReadonlyModel } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';

export interface ReadonlyModelCollection<
  TId extends Id,
  TModel extends ReadonlyModel<TId>
> extends Iterable<TModel> {
  readonly length: number;
  contains(modelOrId: TModel | TId): boolean;
  assertContains(modelOrId: TModel | TId, errorProducer?: () => Error): void;
  whereId(id: TId): TModel;
  count(): number;
  toArray(): ReadonlyArray<TModel>;
  first(): TModel;
  firstOrNull(): TModel | null;
  last(): TModel;
  lastOrNull(): TModel | null;
  isEmpty(): boolean;
  getRemovedModels(): ReadonlyArray<TModel>;
}

export class ModelCollection<TId extends Id, TModel extends Model<TId>>
  implements ReadonlyModelCollection<TId, TModel> {
  private models: Iterable<TModel>;
  private readonly removedModels: TModel[];

  public constructor(models: Iterable<TModel>) {
    this.models = models;
    this.removedModels = [];
  }

  public [Symbol.iterator](): Iterator<TModel> {
    return this.models[Symbol.iterator]();
  }

  public get length(): number {
    return Array.from(this.models).length;
  }

  public toArray(): ReadonlyArray<TModel> {
    return Array.from(this.models);
  }

  public count(): number {
    return this.toArray().length;
  }

  public firstOrNull(): TModel | null {
    return this.toArray()[0] || null;
  }

  public first(): TModel {
    const first = this.firstOrNull();
    if (first === null) {
      throw new Error('collection is empty');
    }
    return first;
  }

  public lastOrNull(): TModel | null {
    const arr = this.toArray();
    return arr[arr.length] || null;
  }

  public last(): TModel {
    const last = this.lastOrNull();
    if (last === null) {
      throw new Error('collection is empty');
    }
    return last;
  }

  public add(modelToAdd: TModel): void {
    this.assertCanAdd(modelToAdd);
    this.models = this.toArray().concat(modelToAdd);
  }

  public addAll(modelsToAdd: Iterable<TModel>): void {
    for (const modelToAdd of modelsToAdd) {
      this.add(modelToAdd);
    }
  }

  public remove(modelToRemove: TModel): void {
    this.assertCanRemove(modelToRemove);
    this.removedModels.push(modelToRemove);
    this.models = this.toArray().filter(
      (model) => !model.equals(modelToRemove),
    );
  }

  public removeAll(modelsToRemove: TModel[]): void {
    for (const modelToRemove of modelsToRemove) {
      this.remove(modelToRemove);
    }
  }

  public whereId(id: TId): TModel {
    const model = this.toArray().find((model) => model.id.equals(id));
    if (!model) {
      throw new Error('model does not exist');
    }
    return model;
  }

  /**
   *
   */
  public contains(modelOrId: TModel | TId): boolean {
    const id = Model.getId(modelOrId);
    return this.isAny((model) => model.id.equals(id));
  }

  public assertContains(
    modelOrId: TModel | TId,
    errorProducer?: () => Error,
  ): void {
    if (!this.contains(modelOrId)) {
      if (!errorProducer) {
        throw new Error(
          'assertion failed: collection does not contain given model',
        );
      }
      throw errorProducer();
    }
  }

  /**
   *
   */
  public getRemovedModels(): ReadonlyArray<TModel> {
    return this.removedModels;
  }

  public isAny(predicate: (model: TModel) => boolean): boolean {
    return this.toArray().some(predicate);
  }

  public areAll(predicate: (model: TModel) => boolean): boolean {
    return this.toArray().every(predicate);
  }

  public isEmpty(): boolean {
    return this.count() === 0;
  }

  protected assertCanAdd(modelToAdd: TModel): void {
    if (this.contains(modelToAdd.id)) {
      throw new Error('model already exists');
    }
  }

  protected assertCanRemove(modelToRemove: TModel): void {
    if (!this.contains(modelToRemove.id)) {
      throw new Error('model does not exist');
    }
  }
}
