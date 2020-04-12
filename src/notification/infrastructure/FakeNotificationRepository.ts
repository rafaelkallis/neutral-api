import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { Notification } from 'notification/domain/Notification';
import { UserId } from 'user/domain/value-objects/UserId';
import { FakeRepository } from 'shared/infrastructure/FakeRepository';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';
import { Optional } from 'shared/domain/Optional';

/**
 * Fake Notification Repository
 */
export class FakeNotificationRepository implements NotificationRepository {
  private readonly fakeRepository: FakeRepository<NotificationId, Notification>;

  public constructor() {
    this.fakeRepository = new FakeRepository();
  }

  public async findPage(
    afterId?: NotificationId | undefined,
  ): Promise<Notification[]> {
    return this.fakeRepository.findPage(afterId);
  }

  public async findById(id: NotificationId): Promise<Notification | undefined> {
    return this.fakeRepository.findById(id);
  }

  public async findByIds(
    ids: NotificationId[],
  ): Promise<Optional<Notification>[]> {
    return this.fakeRepository.findByIds(ids);
  }

  public async exists(id: NotificationId): Promise<boolean> {
    return this.fakeRepository.exists(id);
  }

  public async persist(...models: Notification[]): Promise<void> {
    return this.fakeRepository.persist(...models);
  }

  public async delete(...models: Notification[]): Promise<void> {
    return this.fakeRepository.delete(...models);
  }

  /**
   *
   */
  public async findByOwnerId(ownerId: UserId): Promise<Notification[]> {
    return this.fakeRepository
      .getModels()
      .filter((notification) => notification.ownerId.equals(ownerId));
  }
}
