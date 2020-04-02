import { NotificationFakeRepository } from 'notification/infrastructure/NotificationFakeRepository';
import { Notification } from 'notification/domain/Notification';
import { User } from 'user/domain/User';
import { NotificationApplicationService } from 'notification/application/NotificationApplicationService';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';
import { FakeEventPublisherService } from 'shared/event/publisher/FakeEventPublisherService';
import { ModelFaker } from 'test/ModelFaker';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { Mock } from 'test/Mock';

describe('notification application service', () => {
  let modelFaker: ModelFaker;
  let eventPublisher: FakeEventPublisherService;
  let notificationRepository: NotificationFakeRepository;
  let objectMapper: ObjectMapper;
  let notificationApplicationService: NotificationApplicationService;
  let user: User;
  let mockNotificationDto: unknown;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    eventPublisher = new FakeEventPublisherService();
    notificationRepository = new NotificationFakeRepository();
    objectMapper = Mock(ObjectMapper);
    notificationApplicationService = new NotificationApplicationService(
      notificationRepository,
      eventPublisher,
      objectMapper,
    );
    user = modelFaker.user();
    mockNotificationDto = {};
    jest.spyOn(objectMapper, 'map').mockReturnValue(mockNotificationDto);
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
      const notificationDtos = await notificationApplicationService.getNotificationsByAuthUser(
        user,
      );
      for (const notificationDto of notificationDtos) {
        expect(notificationDto).toEqual(mockNotificationDto);
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
      const notificationDto = await notificationApplicationService.markRead(
        user,
        notification.id.value,
      );
      expect(notification.markRead).toHaveBeenCalled();
      expect(notificationDto).toEqual(mockNotificationDto);
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
