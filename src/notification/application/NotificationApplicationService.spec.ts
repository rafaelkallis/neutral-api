import { MockEventPublisherService } from 'event';
import { NotificationFakeRepository } from 'notification/infrastructure/NotificationFakeRepository';
import { NotificationDomainService } from 'notification/domain/NotificationDomainService';
import { NotificationModel } from 'notification/domain/NotificationModel';
import { ModelFaker } from 'test';
import { UserModel } from 'user';
import { NotificationApplicationService } from 'notification/application/NotificationApplicationService';
import { NotificationDto } from 'notification/application/dto/NotificationDto';

describe('notification application service', () => {
  let modelFaker: ModelFaker;
  let eventPublisher: MockEventPublisherService;
  let notificationRepository: NotificationFakeRepository;
  let notificationDomainService: NotificationDomainService;
  let notificationApplicationService: NotificationApplicationService;
  let user: UserModel;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    eventPublisher = new MockEventPublisherService();
    notificationRepository = new NotificationFakeRepository();
    notificationDomainService = new NotificationDomainService(
      eventPublisher,
      notificationRepository,
    );
    notificationApplicationService = new NotificationApplicationService(
      notificationRepository,
      notificationDomainService,
    );
    user = modelFaker.user();
  });

  it('should be defined', () => {
    expect(notificationApplicationService).toBeDefined();
  });

  describe('get auth user notifications', () => {
    let notifications: NotificationModel[];

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
    let notification: NotificationModel;

    beforeEach(async () => {
      notification = modelFaker.notification(user.id);
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
      const otherUser = modelFaker.user();
      await expect(
        notificationApplicationService.markRead(otherUser, notification.id),
      ).rejects.toThrow();
      expect(notificationDomainService.markRead).not.toHaveBeenCalledWith();
    });
  });
});
