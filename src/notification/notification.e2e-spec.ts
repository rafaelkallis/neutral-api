import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'app.module';
import { UserModel, UserRepository, USER_REPOSITORY } from 'user';
import { ModelFaker } from 'test';
import { TOKEN_SERVICE } from 'token';
import {
  NotificationRepository,
  NOTIFICATION_REPOSITORY,
} from 'notification/domain/NotificationRepository';
import { NotificationModel } from 'notification/domain/NotificationModel';

describe('notifications (e2e)', () => {
  let app: INestApplication;
  let modelFaker: ModelFaker;
  let userRepository: UserRepository;
  let notificationRepository: NotificationRepository;
  let user: UserModel;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    userRepository = module.get(USER_REPOSITORY);
    notificationRepository = module.get(NOTIFICATION_REPOSITORY);

    user = modelFaker.user();
    await userRepository.persist(user);

    session = request.agent(app.getHttpServer());
    const tokenService = module.get(TOKEN_SERVICE);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/notifications (GET)', () => {
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
      const response = await session.get('/notifications');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toHaveLength(3);
      for (const notification of notifications) {
        expect(response.body).toContainEqual({
          id: notification.id,
          type: notification.type,
          isRead: notification.isRead,
          payload: notification.payload,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        });
      }
    });
  });

  describe('/notifications/:id/read (POST)', () => {
    let notification: NotificationModel;

    beforeEach(async () => {
      notification = modelFaker.notification(user.id);
      notification.isRead = false;
      await notificationRepository.persist(notification);
    });

    test('happy path', async () => {
      const response = await session.post(
        `/notifications/${notification.id}/read`,
      );
      expect(response.status).toBe(200);
      const updatedNotification = await notificationRepository.findById(
        notification.id,
      );
      expect(updatedNotification.isRead).toBeTruthy();
    });
  });
});
