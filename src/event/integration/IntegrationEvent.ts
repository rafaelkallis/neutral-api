/**
 * Integration Event
 */
export abstract class IntegrationEvent {
  public readonly createdAt: number;

  public constructor() {
    this.createdAt = Date.now();
  }
}
