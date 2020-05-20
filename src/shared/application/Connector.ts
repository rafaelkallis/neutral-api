import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Subscription } from 'shared/domain/Observer';

@Injectable()
export abstract class Connector implements OnModuleInit, OnModuleDestroy {
  private readonly subscriptions: Subscription[];

  public constructor() {
    this.subscriptions = [];
  }

  protected abstract connect(): Promise<void>;

  public async onModuleInit(): Promise<void> {
    await this.connect();
  }

  public async onModuleDestroy(): Promise<void> {
    await this.unsubscribeSubscriptions();
  }

  protected manageSuscription(subscription: Subscription): void {
    this.subscriptions.push(subscription);
  }

  private async unsubscribeSubscriptions(): Promise<void> {
    for (const subscription of this.subscriptions) {
      await subscription.unsubscribe();
    }
  }
}
