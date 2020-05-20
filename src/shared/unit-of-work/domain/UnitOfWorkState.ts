import { InternalUnitOfWorkStateMachine } from 'shared/unit-of-work/domain/UnitOfWorkStateMachine';

export interface UnitOfWorkStateVisitor<T> {
  visitClean(): T;
  visitDirty(): T;
  visitNew(): T;
}

export interface ReadonlyUnitOfWorkState {
  accept<T>(visitor: UnitOfWorkStateVisitor<T>): T;
}

export abstract class UnitOfWorkState {
  public abstract markDirty(context: InternalUnitOfWorkStateMachine): void;
  public abstract commit(context: InternalUnitOfWorkStateMachine): void;
  public abstract accept<T>(visitor: UnitOfWorkStateVisitor<T>): T;
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

  public accept<T>(visitor: UnitOfWorkStateVisitor<T>): T {
    return visitor.visitNew();
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

  public accept<T>(visitor: UnitOfWorkStateVisitor<T>): T {
    return visitor.visitClean();
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

  public accept<T>(visitor: UnitOfWorkStateVisitor<T>): T {
    return visitor.visitDirty();
  }
}
