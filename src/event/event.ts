export abstract class Event {
  public readonly createdAt: number;

  public constructor() {
    this.createdAt = Date.now();
  }
}
