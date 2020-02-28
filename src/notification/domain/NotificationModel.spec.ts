import { Notification } from 'notification/domain/Notification';
import { User } from 'user/domain/User';
import { NotificationReadEvent } from 'notification/domain/events/NotificationReadEvent';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';
import { NotificationFactoryService } from 'notification/domain/NotificationFactoryService';
import { ModelFaker } from 'test/ModelFaker';

describe('notification model', () => {
  let modelFaker: ModelFaker;
  let notificationFactory: NotificationFactoryService;
  let user: User;

  beforeEach(() => {
    modelFaker = new ModelFaker();
    notificationFactory = new NotificationFactoryService();
    user = modelFaker.user();
  });

  describe('create notification', () => {
    test('happy path', () => {
      const project = modelFaker.project(user.id);
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
      notification = modelFaker.notification(user.id);
      notification.isRead = NotificationIsRead.from(false);
    });

    test('happy path', () => {
      notification.markRead();
      expect(notification.isRead.value).toBeTruthy();
      expect(notification.getDomainEvents()).toContainEqual(
        expect.any(NotificationReadEvent),
      );
    });

    test('should fail if notification is already read', () => {
      notification.isRead = NotificationIsRead.from(true);
      expect(() => notification.markRead()).toThrow();
    });
  });
});
