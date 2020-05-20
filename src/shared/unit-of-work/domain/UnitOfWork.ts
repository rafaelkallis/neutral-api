import { ReadonlyModel } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { UnitOfWorkStateMachine } from 'shared/unit-of-work/domain/UnitOfWorkStateMachine';
import { Subject, Observable } from 'shared/domain/Observer';
import { ReadonlyUnitOfWorkState } from 'shared/unit-of-work/domain/UnitOfWorkState';

export class UnitOfWork {
  private readonly modelStateMachines: [
    ReadonlyModel<Id>,
    UnitOfWorkStateMachine,
  ][];
  private readonly committedModelsSubject: Subject<
    [ReadonlyModel<Id>, ReadonlyUnitOfWorkState]
  >;

  public constructor() {
    this.modelStateMachines = [];
    this.committedModelsSubject = new Subject();
  }

  public get committedModels(): Observable<
    [ReadonlyModel<Id>, ReadonlyUnitOfWorkState]
  > {
    return this.committedModelsSubject;
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

  public async commit(): Promise<void> {
    for (const [model, stateMachine] of this.modelStateMachines) {
      await this.committedModelsSubject.handle([model, stateMachine]);
      stateMachine.commit();
    }
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
