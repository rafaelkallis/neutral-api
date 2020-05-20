import { Notification } from 'notification/domain/Notification';
import { User } from 'user/domain/User';
import { NotificationReadEvent } from 'notification/domain/events/NotificationReadEvent';
import { NotificationFactoryService } from 'notification/domain/NotificationFactoryService';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { UnitOfWork } from 'shared/unit-of-work/domain/UnitOfWork';

describe('notification model', () => {
  let scenario: UnitTestScenario<NotificationFactoryService>;
  let notificationFactory: NotificationFactoryService;
  let user: User;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(NotificationFactoryService)
      .addProviderMock(UnitOfWork)
      .build();
    notificationFactory = scenario.subject;
    user = scenario.modelFaker.user();
  });

  describe('create notification', () => {
    test('happy path', () => {
      const project = scenario.modelFaker.project(user.id);
      const notification = notificationFactory.createProjectFinishedNotification(
        project,
        user.id,
      );
      expect(notification.isRead.value).toBeFalsy();
    });
  });

  describe('read notification', () => {
    let notification: Notification;

    beforeEach(() => {
      notification = scenario.modelFaker.notification(user.id);
    });

    test('happy path', () => {
      notification.markRead();
      expect(notification.isRead.value).toBeTruthy();
      expect(notification.domainEvents).toContainEqual(
        expect.any(NotificationReadEvent),
      );
    });

    test('should fail if notification is already read', () => {
      notification.markRead();
      expect(() => notification.markRead()).toThrow();
    });
  });
});
