export interface SessionState {
  /**
   *
   */
  exists(): boolean;

  /**
   *
   */
  get(): string;

  /**
   *
   */
  set(state: string): void;

  /**
   *
   */
  clear(): void;
}
