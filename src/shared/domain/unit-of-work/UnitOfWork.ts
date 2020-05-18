import { ReadonlyModel } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { UnitOfWorkStateMachine } from 'shared/domain/unit-of-work/UnitOfWorkStateMachine';
import { Subject, Observable } from 'shared/domain/Observer';

export class UnitOfWork {
  private readonly modelStateMachines: [
    ReadonlyModel<Id>,
    UnitOfWorkStateMachine,
  ][];

  // TODO add committedCleanModelsSubject for "optimistic concurrency control"
  private readonly committedDirtyModelsSubject: Subject<ReadonlyModel<Id>>;
  private readonly committedNewModelsSubject: Subject<ReadonlyModel<Id>>;

  public constructor() {
    this.modelStateMachines = [];
    this.committedDirtyModelsSubject = new Subject();
    this.committedNewModelsSubject = new Subject();
  }

  public get committedDirtyModels(): Observable<ReadonlyModel<Id>> {
    return this.committedDirtyModelsSubject;
  }

  public get committedNewModels(): Observable<ReadonlyModel<Id>> {
    return this.committedNewModelsSubject;
  }

  public registerRead(model: ReadonlyModel<Id>): void {
    this.register(model, UnitOfWorkStateMachine.ofCleanState());
  }

  public registerReadArray(models: ReadonlyModel<Id>[]): void {
    models.forEach((model) => this.registerRead(model));
  }

  public registerNew(model: ReadonlyModel<Id>): void {
    this.register(model, UnitOfWorkStateMachine.ofNewState());
  }

  // public markDirty(model: Model<Id>): void {
  //   const stateMachine = this.getModelStateWrapper(model);
  //   stateMachine.markDirty();
  // }

  public async commit(): Promise<void> {
    for (const [model, stateMachine] of this.modelStateMachines) {
      if (stateMachine.isDirty()) {
        await this.committedDirtyModelsSubject.handle(model);
      }
      if (stateMachine.isNew()) {
        await this.committedNewModelsSubject.handle(model);
      }
      stateMachine.commit();
    }
    return Promise.resolve();
  }

  private register(
    model: ReadonlyModel<Id>,
    stateMachine: UnitOfWorkStateMachine,
  ): void {
    for (const [existingModel] of this.modelStateMachines) {
      if (existingModel.equals(model)) {
        throw new Error('model already exists in unit of work');
      }
    }
    this.modelStateMachines.push([model, stateMachine]);
    model.markedDirty.subscribe(() => stateMachine.markDirty());
  }
}
