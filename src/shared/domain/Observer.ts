export interface Observer<T> {
  handle(event: T): Promise<void>;
}

export interface Subscription {
  unsubscribe(): Promise<void>;
}

export interface Observable<T> {
  subscribe(observer: Observer<T>): Promise<Subscription>;
}

export class Subject<T> implements Observable<T>, Observer<T> {
  private readonly observers: Set<Observer<T>>;

  public constructor() {
    this.observers = new Set();
  }

  public async subscribe(observer: Observer<T>): Promise<Subscription> {
    this.observers.add(observer);
    return {
      unsubscribe: async (): Promise<void> => {
        this.observers.delete(observer);
      },
    };
  }

  public async handle(event: T): Promise<void> {
    for (const observer of this.observers) {
      await observer.handle(event);
    }
  }
}
