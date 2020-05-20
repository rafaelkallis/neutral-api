import {
  UnitOfWorkState,
  ReadonlyUnitOfWorkState,
  CleanUnitOfWorkState,
  NewUnitOfWorkState,
  UnitOfWorkStateVisitor,
} from 'shared/unit-of-work/domain/UnitOfWorkState';

/**
 * Encapsulates a UnitOfWork state machine.
 */
export abstract class UnitOfWorkStateMachine
  implements ReadonlyUnitOfWorkState {
  protected _state: UnitOfWorkState;
  public get state(): ReadonlyUnitOfWorkState {
    return this._state;
  }

  protected constructor(state: UnitOfWorkState) {
    this._state = state;
  }

  public static ofCleanState(): UnitOfWorkStateMachine {
    return new InternalUnitOfWorkStateMachine(
      CleanUnitOfWorkState.getInstance(),
    );
  }

  public static ofNewState(): UnitOfWorkStateMachine {
    return new InternalUnitOfWorkStateMachine(NewUnitOfWorkState.getInstance());
  }

  public accept<T>(visitor: UnitOfWorkStateVisitor<T>): T {
    return this.state.accept(visitor);
  }

  public abstract markDirty(): void;
  public abstract commit(): void;

  protected setState(state: UnitOfWorkState): void {
    this._state = state;
  }
}

export class InternalUnitOfWorkStateMachine extends UnitOfWorkStateMachine {
  public constructor(unitOfWorkState: UnitOfWorkState) {
    super(unitOfWorkState);
  }

  public markDirty(): void {
    this._state.markDirty(this);
  }

  public commit(): void {
    this._state.commit(this);
  }

  public setState(state: UnitOfWorkState): void {
    super.setState(state);
  }
}
