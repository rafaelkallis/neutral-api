import td from 'testdouble';
import { Notification } from 'notification/domain/Notification';
import { User } from 'user/domain/User';
import { NotificationApplicationService } from 'notification/application/NotificationApplicationService';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { NotificationDto } from 'notification/application/dto/NotificationDto';
import { UnitTestScenario } from 'test/UnitTestScenario';

describe(NotificationApplicationService.name, () => {
  let scenario: UnitTestScenario<NotificationApplicationService>;
  let notificationRepository: NotificationRepository;
  let objectMapper: ObjectMapper;
  let notificationApplicationService: NotificationApplicationService;
  let user: User;
  let mockNotificationDto: NotificationDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(NotificationApplicationService)
      .addProviderMock(NotificationRepository)
      .addProviderMock(ObjectMapper)
      .build();
    notificationApplicationService = scenario.subject;
    notificationRepository = scenario.module.get(NotificationRepository);
    objectMapper = scenario.module.get(ObjectMapper);
    user = scenario.modelFaker.user();
    mockNotificationDto = td.object();
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

    beforeEach(async () => {
      notifications = [
        scenario.modelFaker.notification(user.id),
        scenario.modelFaker.notification(user.id),
        scenario.modelFaker.notification(user.id),
      ];
      await notificationRepository.persist(...notifications);
      mockNotificationDtos = td.object();
      td.when(
        objectMapper.mapArray(td.matchers.anything(), NotificationDto),
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
      notification = scenario.modelFaker.notification(user.id);
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
      const otherUser = scenario.modelFaker.user();
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
