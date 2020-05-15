import { InternalUnitOfWorkStateWrapper } from 'shared/domain/unit-of-work/UnitOfWorkStateWrapper';

export interface UnitOfWorkStateView {
  isNew(): boolean;
  isRead(): boolean;
  isDirty(): boolean;
}

export interface UnitOfWorkState extends UnitOfWorkStateView {
  markDirty(context: InternalUnitOfWorkStateWrapper): void;
  commit(context: InternalUnitOfWorkStateWrapper): void;
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

  public commit(context: InternalUnitOfWorkStateWrapper): void {
    context.setState(ReadUnitOfWorkState.getInstance());
  }

  public isNew(): boolean {
    return true;
  }

  public isRead(): boolean {
    return false;
  }

  public isDirty(): boolean {
    return false;
  }
}

export class ReadUnitOfWorkState implements UnitOfWorkState {
  private static INSTANCE?: ReadUnitOfWorkState;
  public static getInstance(): UnitOfWorkState {
    if (!ReadUnitOfWorkState.INSTANCE) {
      ReadUnitOfWorkState.INSTANCE = new ReadUnitOfWorkState();
    }
    return ReadUnitOfWorkState.INSTANCE;
  }
  public markDirty(context: InternalUnitOfWorkStateWrapper): void {
    context.setState(DirtyUnitOfWorkState.getInstance());
  }
  public commit(): void {}

  public isNew(): boolean {
    return false;
  }

  public isRead(): boolean {
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
  public commit(context: InternalUnitOfWorkStateWrapper): void {
    context.setState(ReadUnitOfWorkState.getInstance());
  }

  public isNew(): boolean {
    return false;
  }

  public isRead(): boolean {
    return false;
  }

  public isDirty(): boolean {
    return true;
  }
}
