import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { EmailSender, EMAIL_SENDER } from 'email/email-sender';
import { EVENT_BUS, EventBus, EventSubscription } from 'event';
import { ProjectFinishedEvent } from 'project/events';
import { EventHandler } from 'event/event-subscriber';

/**
 * Email Event Handler Service
 */
@Injectable()
export class EmailEventHandlerService
  implements OnModuleInit, OnModuleDestroy, EventHandler<ProjectFinishedEvent> {
  private readonly eventBus: EventBus;
  private readonly emailSender: EmailSender;
  private readonly eventSubscriptions: EventSubscription[];

  public constructor(
    @Inject(EVENT_BUS) eventBus: EventBus,
    @Inject(EMAIL_SENDER) emailSender: EmailSender,
  ) {
    this.eventBus = eventBus;
    this.emailSender = emailSender;
    this.eventSubscriptions = [];
  }

  async onModuleInit(): Promise<void> {
    this.eventSubscriptions.push(
      await this.eventBus.subscribe(ProjectFinishedEvent, this),
    );
  }

  async onModuleDestroy(): Promise<void> {
    for (const eventSubscription of this.eventSubscriptions) {
      await eventSubscription.unsubscribe();
    }
  }

  public async handleEvent(
    projectFinishedEvent: ProjectFinishedEvent,
  ): Promise<void> {
    console.log(projectFinishedEvent);
  }
}
