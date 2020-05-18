import {
  UnitOfWorkState,
  UnitOfWorkStateView,
  CleanUnitOfWorkState,
  NewUnitOfWorkState,
} from 'shared/domain/unit-of-work/UnitOfWorkState';

/**
 * Encapsulates a UnitOfWork state machine.
 */
export abstract class UnitOfWorkStateMachine implements UnitOfWorkStateView {
  protected _state: UnitOfWorkState;
  public get state(): UnitOfWorkStateView {
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

  public isNew(): boolean {
    return this.state.isNew();
  }
  public isClean(): boolean {
    return this.state.isClean();
  }
  public isDirty(): boolean {
    return this.state.isDirty();
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
