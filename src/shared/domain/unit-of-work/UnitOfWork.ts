import { Model } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { UnitOfWorkStateWrapper } from 'shared/domain/unit-of-work/UnitOfWorkStateWrapper';
import { Subject, Observable } from 'shared/domain/Observer';

export class UnitOfWork {
  private readonly modelStates: [Model<Id>, UnitOfWorkStateWrapper][];

  private readonly committedReadModelsSubject: Subject<Model<Id>>;
  private readonly committedDirtyModelsSubject: Subject<Model<Id>>;
  private readonly committedNewModelsSubject: Subject<Model<Id>>;

  public constructor() {
    this.modelStates = [];
    this.committedReadModelsSubject = new Subject();
    this.committedDirtyModelsSubject = new Subject();
    this.committedNewModelsSubject = new Subject();
  }

  public get committedReadModels(): Observable<Model<Id>> {
    return this.committedReadModelsSubject;
  }

  public get committedDirtyModels(): Observable<Model<Id>> {
    return this.committedDirtyModelsSubject;
  }

  public get committedNewModels(): Observable<Model<Id>> {
    return this.committedNewModelsSubject;
  }

  public registerRead(model: Model<Id>): void {
    this.putModel(model, UnitOfWorkStateWrapper.ofReadState());
  }

  public registerNew(model: Model<Id>): void {
    this.putModel(model, UnitOfWorkStateWrapper.ofNewState());
  }

  public markDirty(model: Model<Id>): void {
    const context = this.getModelState(model);
    context.markDirty();
  }

  public async commit(): Promise<void> {
    for (const [model, context] of this.modelStates) {
      if (context.isRead()) {
        await this.committedReadModelsSubject.handle(model);
      }
      if (context.isDirty()) {
        await this.committedDirtyModelsSubject.handle(model);
      }
      if (context.isNew()) {
        await this.committedNewModelsSubject.handle(model);
      }
      context.commit();
    }
    return Promise.resolve();
  }

  private putModel(model: Model<Id>, context: UnitOfWorkStateWrapper): void {
    for (const [existingModel] of this.modelStates) {
      if (existingModel.equals(model)) {
        throw new Error('model already exists in unit of work');
      }
    }
    this.modelStates.push([model, context]);
  }

  private getModelState(model: Model<Id>): UnitOfWorkStateWrapper {
    for (const modelState of this.modelStates) {
      if (modelState[0].equals(model)) {
        return modelState[1];
      }
    }
    throw new Error('model not found in unit of work');
  }
}
