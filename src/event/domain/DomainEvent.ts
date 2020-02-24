/**
 * Domain Event
 */
export abstract class DomainEvent {
  public readonly createdAt: number;

  public constructor() {
    this.createdAt = Date.now();
  }
}
