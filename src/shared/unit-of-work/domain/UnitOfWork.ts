import { ReadonlyModel } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { UnitOfWorkStateMachine } from 'shared/unit-of-work/domain/UnitOfWorkStateMachine';
import { Subject, Observable } from 'shared/domain/Observer';
import { ReadonlyUnitOfWorkState } from 'shared/unit-of-work/domain/UnitOfWorkState';
import { ReadonlyAggregateRoot } from 'shared/domain/AggregateRoot';

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

  public registerRead(readAggregateRoot: ReadonlyAggregateRoot<Id>): void {
    this.register(readAggregateRoot, UnitOfWorkStateMachine.ofCleanState());
  }

  public registerReadArray(aggregateRoots: ReadonlyAggregateRoot<Id>[]): void {
    aggregateRoots.forEach((ar) => this.registerRead(ar));
  }

  public registerNew(newAggregateRoot: ReadonlyAggregateRoot<Id>): void {
    this.register(newAggregateRoot, UnitOfWorkStateMachine.ofNewState());
  }

  public async commit(): Promise<void> {
    for (const [model, stateMachine] of this.modelStateMachines) {
      await this.committedModelsSubject.handle([model, stateMachine]);
      stateMachine.commit();
    }
  }

  private register(
    aggregateRoot: ReadonlyAggregateRoot<Id>,
    stateMachine: UnitOfWorkStateMachine,
  ): void {
    for (const [existingModel] of this.modelStateMachines) {
      if (existingModel.equals(aggregateRoot)) {
        throw new Error('model already exists in unit of work');
      }
    }
    this.modelStateMachines.push([aggregateRoot, stateMachine]);
    aggregateRoot.markedDirty.subscribe(() => stateMachine.markDirty());
  }
}
