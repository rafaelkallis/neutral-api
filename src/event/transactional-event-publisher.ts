import { EventPublisher } from 'event/event-publisher';

/**
 * Transactional Event Publisher
 */
export interface TransactionalEventPublisher extends EventPublisher {
  transact<T>(
    transactionHandler: (eventPublisher: EventPublisher) => Promise<T>,
  ): Promise<T>;
}
