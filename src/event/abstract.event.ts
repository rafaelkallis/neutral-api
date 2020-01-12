/**
 * Abstract Event
 */
export abstract class AbstractEvent {
  public readonly createdAt: number;

  public constructor() {
    this.createdAt = Date.now();
  }
}
