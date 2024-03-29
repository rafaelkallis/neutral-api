import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { Notification } from 'notification/domain/Notification';
import { User } from 'user/domain/User';

describe('notifications (e2e)', () => {
  let scenario: IntegrationTestScenario;
  let user: User;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    user = await scenario.createUser();
    await scenario.authenticateUser(user);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  describe('/notifications (GET)', () => {
    let notifications: Notification[];

    beforeEach(async () => {
      notifications = [
        scenario.modelFaker.notification(user.id),
        scenario.modelFaker.notification(user.id),
        scenario.modelFaker.notification(user.id),
      ];
      await scenario.notificationRepository.persist(...notifications);
    });

    test('happy path', async () => {
      const response = await scenario.session.get('/notifications');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toHaveLength(3);
      for (const notification of notifications) {
        expect(response.body).toContainEqual({
          id: notification.id.value,
          type: notification.type.value,
          isRead: notification.isRead.value,
          payload: notification.payload,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        });
      }
    });
  });

  describe('/notifications/:id/read (POST)', () => {
    let notification: Notification;

    beforeEach(async () => {
      notification = scenario.modelFaker.notification(user.id);
      await scenario.notificationRepository.persist(notification);
    });

    test('happy path', async () => {
      const response = await scenario.session.post(
        `/notifications/${notification.id.toString()}/read`,
      );
      expect(response.status).toBe(200);
      const updatedNotification = await scenario.notificationRepository.findById(
        notification.id,
      );
      if (!updatedNotification) {
        throw new Error();
      }
      expect(updatedNotification.isRead).toBeTruthy();
    });
  });
});
