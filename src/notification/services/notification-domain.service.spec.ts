import { MockEventPublisherService } from 'event';
import { FakeNotificationRepository } from 'notification/repositories/fake-notification.repository';
import { NotificationDomainService } from 'notification/services/notification-domain.service';
import { NotificationModel } from 'notification/notification.model';
import { EntityFaker } from 'test';
import { UserModel } from 'user';
import { NotificationReadEvent } from 'notification/events/notification-read.event';

describe('notification domain service', () => {
  let entityFaker: EntityFaker;
  let eventPublisher: MockEventPublisherService;
  let notificationRepository: FakeNotificationRepository;
  let notificationDomainService: NotificationDomainService;
  let user: UserModel;

  beforeEach(async () => {
    entityFaker = new EntityFaker();
    eventPublisher = new MockEventPublisherService();
    notificationRepository = new FakeNotificationRepository();
    notificationDomainService = new NotificationDomainService(
      eventPublisher,
      notificationRepository,
    );
    user = entityFaker.user();
  });

  it('should be defined', () => {
    expect(notificationDomainService).toBeDefined();
  });

  describe('read notification', () => {
    let notification: NotificationModel;

    beforeEach(async () => {
      notification = entityFaker.notification(user.id);
      notification.isRead = false;
      await notificationRepository.persist(notification);
      jest.spyOn(notificationRepository, 'persist');
    });

    test('happy path', async () => {
      await notificationDomainService.markRead(notification);
      expect(notificationRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({ isRead: true }),
      );
      expect(eventPublisher.getPublishedEvents()).toContainEqual(
        expect.any(NotificationReadEvent),
      );
    });

    test('should fail if notification is already read', async () => {
      notification.isRead = true;
      await notificationRepository.persist(notification);
      await expect(
        notificationDomainService.markRead(notification),
      ).rejects.toThrow();
    });
  });
});
