import { Injectable } from '@nestjs/common';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { HandleDomainEvent } from 'shared/domain-event/application/DomainEventHandler';

/**
 * User Domain Event Handlers
 */
@Injectable()
export class UserDomainEventHandlers {
  private readonly emailManager: EmailManager;

  public constructor(emailManager: EmailManager) {
    this.emailManager = emailManager;
  }

  @HandleDomainEvent(
    EmailChangeRequestedEvent,
    'on_email_change_requested_send_email_change_email',
  )
  public async onEmailChangeRequestedSendEmailChangeEmail(
    event: EmailChangeRequestedEvent,
  ): Promise<void> {
    await this.emailManager.sendEmailChangeEmail(
      event.email.value,
      event.magicEmailChangeLink,
    );
  }
}
