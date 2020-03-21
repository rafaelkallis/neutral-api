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
import { EmailManager } from 'email/EmailManager';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { ModelFaker } from 'test/ModelFaker';
import { Project } from 'project/domain/Project';
import { ObjectStorage } from 'object-storage/application/ObjectStorage';

type Session = request.SuperTest<request.Test>;

export class TestScenario {
  public readonly primitiveFaker: PrimitiveFaker;
  public readonly modelFaker: ModelFaker;

  public readonly app: INestApplication;
  public readonly module: TestingModule;
  public readonly userRepository: UserRepository;
  public readonly projectRepository: ProjectRepository;
  public readonly notificationRepository: NotificationRepository;

  public readonly tokenManager: TokenManager;
  public readonly emailManager: EmailManager;
  public readonly objectStorage: ObjectStorage;

  public readonly session: Session;

  public constructor(
    primitiveFaker: PrimitiveFaker,
    modelFaker: ModelFaker,
    app: INestApplication,
    module: TestingModule,
    userRepository: UserRepository,
    projectRepository: ProjectRepository,
    notificationRepository: NotificationRepository,
    tokenManager: TokenManager,
    emailManager: EmailManager,
    objectStorage: ObjectStorage,
    session: Session,
  ) {
    this.primitiveFaker = primitiveFaker;
    this.modelFaker = modelFaker;
    this.app = app;
    this.module = module;
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.notificationRepository = notificationRepository;
    this.tokenManager = tokenManager;
    this.emailManager = emailManager;
    this.objectStorage = objectStorage;
    this.session = session;
  }

  public static async create(): Promise<TestScenario> {
    const primitiveFaker = new PrimitiveFaker();
    const modelFaker = new ModelFaker(primitiveFaker);
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = module.createNestApplication();
    await app.init();
    const session = request.agent(app.getHttpServer());
    return new TestScenario(
      primitiveFaker,
      modelFaker,
      app,
      module,
      module.get(USER_REPOSITORY),
      module.get(PROJECT_REPOSITORY),
      module.get(NOTIFICATION_REPOSITORY),
      module.get(TOKEN_MANAGER),
      module.get(EmailManager),
      module.get(ObjectStorage),
      session,
    );
  }

  public async teardown(): Promise<void> {
    await this.app.close();
  }

  public async authenticateUser(user: User): Promise<void> {
    const loginToken = this.tokenManager.newLoginToken(
      user.id,
      user.lastLoginAt,
    );
    await this.session.post(`/auth/login/${loginToken}`);
  }

  public async createUser(): Promise<User> {
    const user = this.modelFaker.user();
    await this.userRepository.persist(user);
    return user;
  }

  public async createProject(creator: User): Promise<Project> {
    const project = this.modelFaker.project(creator.id);
    await this.projectRepository.persist(project);
    return project;
  }

  /**
   *
   */
  public async sleep(millis: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, millis));
  }
}
