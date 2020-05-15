import {
  UnitOfWorkState,
  UnitOfWorkStateView,
  ReadUnitOfWorkState,
  NewUnitOfWorkState,
} from 'shared/domain/unit-of-work/UnitOfWorkState';

export abstract class UnitOfWorkStateWrapper {
  protected _state: UnitOfWorkState;
  public get state(): UnitOfWorkStateView {
    return this._state;
  }

  protected constructor(state: UnitOfWorkState) {
    this._state = state;
  }

  public static ofReadState(): UnitOfWorkStateWrapper {
    return new InternalUnitOfWorkStateWrapper(
      ReadUnitOfWorkState.getInstance(),
    );
  }

  public static ofNewState(): UnitOfWorkStateWrapper {
    return new InternalUnitOfWorkStateWrapper(NewUnitOfWorkState.getInstance());
  }

  public isNew(): boolean {
    return this.state.isNew();
  }
  public isRead(): boolean {
    return this.state.isRead();
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

export class InternalUnitOfWorkStateWrapper extends UnitOfWorkStateWrapper {
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
