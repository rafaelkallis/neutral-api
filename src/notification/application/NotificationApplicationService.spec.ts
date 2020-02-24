import { NotificationFakeRepository } from 'notification/infrastructure/NotificationFakeRepository';
import { Notification } from 'notification/domain/Notification';
import { ModelFaker } from 'test';
import { User } from 'user/domain/User';
import { NotificationApplicationService } from 'notification/application/NotificationApplicationService';
import { NotificationDto } from 'notification/application/dto/NotificationDto';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';
import { MockEventPublisherService } from 'event/publisher/mock-event-publisher.service';

describe('notification application service', () => {
  let modelFaker: ModelFaker;
  let eventPublisher: MockEventPublisherService;
  let notificationRepository: NotificationFakeRepository;
  let notificationApplicationService: NotificationApplicationService;
  let user: User;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    eventPublisher = new MockEventPublisherService();
    notificationRepository = new NotificationFakeRepository();
    notificationApplicationService = new NotificationApplicationService(
      notificationRepository,
      eventPublisher,
    );
    user = modelFaker.user();
  });

  it('should be defined', () => {
    expect(notificationApplicationService).toBeDefined();
  });

  describe('get auth user notifications', () => {
    let notifications: Notification[];

    beforeEach(async () => {
      notifications = [
        modelFaker.notification(user.id),
        modelFaker.notification(user.id),
        modelFaker.notification(user.id),
      ];
      await notificationRepository.persist(...notifications);
    });

    test('happy path', async () => {
      const actualNotificationDtos = await notificationApplicationService.getNotificationsByAuthUser(
        user,
      );
      for (const notification of notifications) {
        const expectedNotificationDto = NotificationDto.fromModel(notification);
        expect(actualNotificationDtos).toContainEqual(expectedNotificationDto);
      }
    });
  });

  describe('mark read', () => {
    let notification: Notification;

    beforeEach(async () => {
      notification = modelFaker.notification(user.id);
      notification.isRead = NotificationIsRead.from(false);
      await notificationRepository.persist(notification);
      jest.spyOn(notification, 'markRead');
    });

    test('happy path', async () => {
      await notificationApplicationService.markRead(
        user,
        notification.id.value,
      );
      expect(notification.markRead).toHaveBeenCalled();
    });

    test('should fail if authenticated user tries to mark a notification owner by another user as read', async () => {
      const otherUser = modelFaker.user();
      await expect(
        notificationApplicationService.markRead(
          otherUser,
          notification.id.value,
        ),
      ).rejects.toThrow();
      expect(notification.markRead).not.toHaveBeenCalledWith();
    });
  });
});
