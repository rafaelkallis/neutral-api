import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'app/AppModule';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { User } from 'user/domain/User';
import { TokenManager } from 'shared/token/application/TokenManager';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { Project } from 'project/domain/project/Project';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { TestScenario } from 'test/TestScenario';
import { UnitOfWork } from 'shared/unit-of-work/domain/UnitOfWork';
import { ContextIdFactory } from '@nestjs/core';
import { UserRepositoryStrategy } from 'user/domain/UserRepositoryStrategy';

type Session = request.SuperTest<request.Test>;

export class IntegrationTestScenario extends TestScenario {
  public readonly app: INestApplication;
  public readonly userRepository: UserRepositoryStrategy;
  public readonly projectRepository: ProjectRepository;
  public readonly notificationRepository: NotificationRepository;

  public readonly tokenManager: TokenManager;
  public readonly emailManager: EmailManager;
  public readonly objectStorage: ObjectStorage;

  public readonly session: Session;

  public constructor(
    app: INestApplication,
    module: TestingModule,
    userRepository: UserRepositoryStrategy,
    projectRepository: ProjectRepository,
    notificationRepository: NotificationRepository,
    tokenManager: TokenManager,
    emailManager: EmailManager,
    objectStorage: ObjectStorage,
    session: Session,
  ) {
    super(module);
    this.app = app;
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.notificationRepository = notificationRepository;
    this.tokenManager = tokenManager;
    this.emailManager = emailManager;
    this.objectStorage = objectStorage;
    this.session = session;
  }

  public static async create(): Promise<IntegrationTestScenario> {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = await module.createNestApplication().init();
    const session = request.agent(app.getHttpServer());
    return new IntegrationTestScenario(
      app,
      module,
      module.get(UserRepositoryStrategy),
      module.get(ProjectRepository),
      module.get(NotificationRepository),
      module.get(TokenManager),
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

  public async createUnitOfWork(): Promise<UnitOfWork> {
    const contextId = ContextIdFactory.create();
    const unitOfWork = await this.module.resolve(UnitOfWork, contextId);
    return unitOfWork;
  }

  /**
   *
   */
  public async sleep(millis: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, millis));
  }
}
