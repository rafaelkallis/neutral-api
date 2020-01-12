import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'app.module';
import { UserEntity, UserRepository, USER_REPOSITORY } from 'user';
import { EntityFaker } from 'test';
import { TOKEN_SERVICE } from 'token';
import {
  NotificationRepository,
  NOTIFICATION_REPOSITORY,
} from 'notification/repositories/notification.repository';
import { NotificationEntity } from 'notification/entities/notification.entity';
import { NotificationDto } from 'notification/dto/notification.dto';

describe('notifications (e2e)', () => {
  let entityFaker: EntityFaker;
  let userRepository: UserRepository;
  let notificationRepository: NotificationRepository;
  let user: UserEntity;
  let session: request.SuperTest<request.Test>;

  beforeEach(async () => {
    entityFaker = new EntityFaker();
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    userRepository = module.get(USER_REPOSITORY);
    notificationRepository = module.get(NOTIFICATION_REPOSITORY);

    user = entityFaker.user();
    await userRepository.persist(user);

    session = request.agent(app.getHttpServer());
    const tokenService = module.get(TOKEN_SERVICE);
    const loginToken = tokenService.newLoginToken(user.id, user.lastLoginAt);
    await session.post(`/auth/login/${loginToken}`);
  });

  describe('/notifications (GET)', () => {
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
      const response = await session.get('/notifications');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toHaveLength(3);
      for (const notification of notifications) {
        const expectedNotification = NotificationDto.fromEntity(notification);
        expect(response.body).toContainEqual(expectedNotification);
      }
    });
  });

  describe('/notifications/:id/read (POST)', () => {
    let notification: NotificationEntity;

    beforeEach(async () => {
      notification = entityFaker.notification(user.id);
      notification.isRead = false;
      await notificationRepository.persist(notification);
    });

    test('happy path', async () => {
      const response = await session.post(
        `/notifications/${notification.id}/read`,
      );
      expect(response.status).toBe(200);
      const updatedNotification = await notificationRepository.findOne(
        notification.id,
      );
      expect(updatedNotification.isRead).toBeTruthy();
    });
  });
});
