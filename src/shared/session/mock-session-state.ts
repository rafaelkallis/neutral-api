import { SessionState } from 'shared/session/session-state';

/**
 *
 */
export class MockSessionState implements SessionState {
  private state: string | null;

  public constructor() {
    this.state = null;
  }

  /**
   *
   */
  public exists(): boolean {
    return Boolean(this.state);
  }

  /**
   *
   */
  public get(): string {
    if (!this.state) {
      throw new Error('no session set');
    }
    return this.state;
  }

  /**
   *
   */
  public set(state: string): void {
    this.state = state;
  }

  /**
   *
   */
  public clear(): void {
    this.state = null;
  }
}
