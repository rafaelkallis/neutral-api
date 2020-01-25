import { MockEventPublisher } from 'event';
import { FakeNotificationRepository } from 'notification/repositories/fake-notification.repository';
import { NotificationDomainService } from 'notification/services/notification-domain.service';
import { NotificationEntity } from 'notification/entities/notification.entity';
import { EntityFaker } from 'test';
import { UserEntity } from 'user';
import { NotificationReadEvent } from 'notification/events/notification-read.event';
import { NotificationApplicationService } from 'notification/services/notification-application.service';
import { NotificationDto } from 'notification/dto/notification.dto';

describe('notification application service', () => {
  let entityFaker: EntityFaker;
  let eventPublisher: MockEventPublisher;
  let notificationRepository: FakeNotificationRepository;
  let notificationDomainService: NotificationDomainService;
  let notificationApplicationService: NotificationApplicationService;
  let user: UserEntity;

  beforeEach(async () => {
    entityFaker = new EntityFaker();
    eventPublisher = new MockEventPublisher();
    notificationRepository = new FakeNotificationRepository();
    notificationDomainService = new NotificationDomainService(
      eventPublisher,
      notificationRepository,
    );
    notificationApplicationService = new NotificationApplicationService(
      notificationRepository,
      notificationDomainService,
    );
    user = entityFaker.user();
  });

  it('should be defined', () => {
    expect(notificationApplicationService).toBeDefined();
  });

  describe('get auth user notifications', () => {
    let notifications: NotificationEntity[];

    beforeEach(async () => {
      notifications = [
        entityFaker.notification(user.id),
        entityFaker.notification(user.id),
        entityFaker.notification(user.id),
      ];
      await notificationRepository.persist(...notifications);
    });

    test('happy path', async () => {
      const actualNotificationDtos = await notificationApplicationService.getNotificationsByAuthUser(
        user,
      );
      for (const notification of notifications) {
        const expectedNotificationDto = NotificationDto.fromEntity(
          notification,
        );
        expect(actualNotificationDtos).toContainEqual(expectedNotificationDto);
      }
    });
  });

  describe('mark read', () => {
    let notification: NotificationEntity;

    beforeEach(async () => {
      notification = entityFaker.notification(user.id);
      notification.isRead = false;
      await notificationRepository.persist(notification);
      jest.spyOn(notificationDomainService, 'markRead');
    });

    test('happy path', async () => {
      await notificationApplicationService.markRead(user, notification.id);
      expect(notificationDomainService.markRead).toHaveBeenCalledWith(
        notification,
      );
    });

    test('should fail if authenticated user tries to mark a notification owner by another user as read', async () => {
      const otherUser = entityFaker.user();
      await expect(
        notificationApplicationService.markRead(otherUser, notification.id),
      ).rejects.toThrow();
      expect(notificationDomainService.markRead).not.toHaveBeenCalledWith();
    });
  });
});