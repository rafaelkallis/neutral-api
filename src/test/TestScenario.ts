import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'app/AppModule';
import { UserRepository, USER_REPOSITORY } from 'user/domain/UserRepository';
import {
  PROJECT_REPOSITORY,
  ProjectRepository,
} from 'project/domain/ProjectRepository';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from 'notification/domain/NotificationRepository';
import { User } from 'user/domain/User';
import { TokenManager, TOKEN_MANAGER } from 'token/application/TokenManager';
import { EmailManager, EMAIL_MANAGER } from 'email/EmailManager';
import { PrimitiveFaker } from 'test/fakers/PrimitiveFaker';
import { ModelFaker } from 'test/fakers/ModelFaker';

export class TestScenario {
  public static readonly primitiveFaker = new PrimitiveFaker();
  public static readonly modelFaker = new ModelFaker();

  public readonly app: INestApplication;
  public readonly module: TestingModule;
  public readonly userRepository: UserRepository;
  public readonly projectRepository: ProjectRepository;
  public readonly notificationRepository: NotificationRepository;

  public readonly session: request.SuperTest<request.Test>;

  public readonly tokenManager: TokenManager;
  public readonly emailManager: EmailManager;

  public constructor(
    app: INestApplication,
    module: TestingModule,
    userRepository: UserRepository,
    projectRepository: ProjectRepository,
    notificationRepository: NotificationRepository,
    session: request.SuperTest<request.Test>,
    tokenManager: TokenManager,
    emailManager: EmailManager,
  ) {
    this.app = app;
    this.module = module;
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.notificationRepository = notificationRepository;
    this.session = session;
    this.tokenManager = tokenManager;
    this.emailManager = emailManager;
  }

  public static async create(): Promise<TestScenario> {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = module.createNestApplication();
    await app.init();
    return new TestScenario(
      app,
      module,
      module.get<UserRepository>(USER_REPOSITORY),
      module.get<ProjectRepository>(PROJECT_REPOSITORY),
      module.get<NotificationRepository>(NOTIFICATION_REPOSITORY),
      request.agent(app.getHttpServer()),
      module.get<TokenManager>(TOKEN_MANAGER),
      module.get<EmailManager>(EMAIL_MANAGER),
    );
  }

  public async setup(): Promise<void> {
    await this.app.init();
  }

  public async teardown(): Promise<void> {
    await this.app.close();
  }

  public async authenticateWithUser(user: User): Promise<void> {
    const loginToken = this.tokenManager.newLoginToken(
      user.id,
      user.lastLoginAt,
    );
    await this.session.post(`/auth/login/${loginToken}`);
  }
}
