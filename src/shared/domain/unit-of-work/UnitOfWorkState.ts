import { InternalUnitOfWorkStateMachine } from 'shared/domain/unit-of-work/UnitOfWorkStateMachine';

export interface UnitOfWorkStateView {
  isNew(): boolean;
  isClean(): boolean;
  isDirty(): boolean;
}

export interface UnitOfWorkState extends UnitOfWorkStateView {
  markDirty(context: InternalUnitOfWorkStateMachine): void;
  commit(context: InternalUnitOfWorkStateMachine): void;
}

export class NewUnitOfWorkState implements UnitOfWorkState {
  private static INSTANCE?: NewUnitOfWorkState;
  public static getInstance(): UnitOfWorkState {
    if (!NewUnitOfWorkState.INSTANCE) {
      NewUnitOfWorkState.INSTANCE = new NewUnitOfWorkState();
    }
    return NewUnitOfWorkState.INSTANCE;
  }

  public markDirty(): void {}

  public commit(context: InternalUnitOfWorkStateMachine): void {
    context.setState(CleanUnitOfWorkState.getInstance());
  }

  public isNew(): boolean {
    return true;
  }

  public isClean(): boolean {
    return false;
  }

  public isDirty(): boolean {
    return false;
  }
}

export class CleanUnitOfWorkState implements UnitOfWorkState {
  private static INSTANCE?: CleanUnitOfWorkState;
  public static getInstance(): UnitOfWorkState {
    if (!CleanUnitOfWorkState.INSTANCE) {
      CleanUnitOfWorkState.INSTANCE = new CleanUnitOfWorkState();
    }
    return CleanUnitOfWorkState.INSTANCE;
  }
  public markDirty(context: InternalUnitOfWorkStateMachine): void {
    context.setState(DirtyUnitOfWorkState.getInstance());
  }
  public commit(): void {}

  public isNew(): boolean {
    return false;
  }

  public isClean(): boolean {
    return true;
  }

  public isDirty(): boolean {
    return false;
  }
}

export class DirtyUnitOfWorkState implements UnitOfWorkState {
  private static INSTANCE?: DirtyUnitOfWorkState;
  public static getInstance(): UnitOfWorkState {
    if (!DirtyUnitOfWorkState.INSTANCE) {
      DirtyUnitOfWorkState.INSTANCE = new DirtyUnitOfWorkState();
    }
    return DirtyUnitOfWorkState.INSTANCE;
  }
  public markDirty(): void {}
  public commit(context: InternalUnitOfWorkStateMachine): void {
    context.setState(CleanUnitOfWorkState.getInstance());
  }

  public isNew(): boolean {
    return false;
  }

  public isClean(): boolean {
    return false;
  }

  public isDirty(): boolean {
    return true;
  }
}
