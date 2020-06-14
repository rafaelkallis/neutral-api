import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { Notification } from 'notification/domain/Notification';
import { UserId } from 'user/domain/value-objects/UserId';
import { MemoryRepository } from 'shared/infrastructure/MemoryRepository';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';

/**
 * Memory Notification Repository
 */
export class MemoryNotificationRepository extends NotificationRepository {
  private readonly memoryRepository: MemoryRepository<
    NotificationId,
    Notification
  >;

  public constructor(domainEventBroker: DomainEventBroker) {
    super(domainEventBroker);
    this.memoryRepository = MemoryRepository.create();
  }

  public async findPage(
    afterId?: NotificationId | undefined,
  ): Promise<Notification[]> {
    return this.memoryRepository.findPage(afterId);
  }

  public async findById(id: NotificationId): Promise<Notification | undefined> {
    return this.memoryRepository.findById(id);
  }

  public async findByIds(
    ids: NotificationId[],
  ): Promise<(Notification | undefined)[]> {
    return this.memoryRepository.findByIds(ids);
  }

  protected async doPersist(...models: Notification[]): Promise<void> {
    return this.memoryRepository.persist(...models);
  }

  /**
   *
   */
  public async findByOwnerId(ownerId: UserId): Promise<Notification[]> {
    const results = this.memoryRepository
      .getModels()
      .filter((notification) => notification.ownerId.equals(ownerId));
    return Promise.resolve(results);
  }
}
