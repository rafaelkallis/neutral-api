import td from 'testdouble';
import { Notification } from 'notification/domain/Notification';
import { User } from 'user/domain/User';
import { NotificationApplicationService } from 'notification/application/NotificationApplicationService';
import { ModelFaker } from 'test/ModelFaker';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { NotificationDto } from 'notification/application/dto/NotificationDto';

describe(NotificationApplicationService.name, () => {
  let modelFaker: ModelFaker;
  let notificationRepository: NotificationRepository;
  let objectMapper: ObjectMapper;
  let notificationApplicationService: NotificationApplicationService;
  let user: User;
  let mockNotificationDto: unknown;

  beforeEach(() => {
    modelFaker = new ModelFaker();
    notificationRepository = td.object();
    objectMapper = td.object();
    notificationApplicationService = new NotificationApplicationService(
      notificationRepository,
      objectMapper,
    );
    user = modelFaker.user();
    mockNotificationDto = {};
    td.when(
      objectMapper.map(td.matchers.isA(Notification), NotificationDto),
    ).thenResolve(mockNotificationDto);
  });

  it('should be defined', () => {
    expect(notificationApplicationService).toBeDefined();
  });

  describe('get auth user notifications', () => {
    let notifications: Notification[];
    let mockNotificationDtos: NotificationDto[];

    beforeEach(() => {
      notifications = [
        modelFaker.notification(user.id),
        modelFaker.notification(user.id),
        modelFaker.notification(user.id),
      ];
      td.when(notificationRepository.findByOwnerId(user.id)).thenResolve(
        notifications,
      );
      mockNotificationDtos = td.object();
      td.when(
        objectMapper.mapArray(notifications, NotificationDto),
      ).thenResolve(mockNotificationDtos);
    });

    test('happy path', async () => {
      const notificationDtos = await notificationApplicationService.getNotificationsByAuthUser(
        user,
      );
      expect(notificationDtos).toBe(mockNotificationDtos);
    });
  });

  describe('mark read', () => {
    let notification: Notification;

    beforeEach(() => {
      notification = modelFaker.notification(user.id);
      td.when(notificationRepository.findById(notification.id)).thenResolve(
        notification,
      );
      jest.spyOn(notification, 'markRead');
    });

    test('happy path', async () => {
      const notificationDto = await notificationApplicationService.markRead(
        user,
        notification.id.value,
      );
      expect(notification.markRead).toHaveBeenCalled();
      expect(notificationDto).toBe(mockNotificationDto);
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
