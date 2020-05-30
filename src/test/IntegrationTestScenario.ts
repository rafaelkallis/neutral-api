import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'app/AppModule';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { User, ReadonlyUser } from 'user/domain/User';
import { TokenManager } from 'shared/token/application/TokenManager';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { Project } from 'project/domain/project/Project';
import { Notification } from 'notification/domain/Notification';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { TestScenario } from 'test/TestScenario';
import { UnitOfWork } from 'shared/unit-of-work/domain/UnitOfWork';
import { ContextIdFactory, ContextId } from '@nestjs/core';
import { UserRepositoryStrategy } from 'user/domain/UserRepositoryStrategy';

type Session = request.SuperTest<request.Test>;

export class IntegrationTestScenario extends TestScenario {
  public readonly app: INestApplication;
  public readonly session: Session;

  public readonly unitOfWork: UnitOfWork;

  public readonly userRepository: UserRepositoryStrategy;
  public readonly projectRepository: ProjectRepository;
  public readonly notificationRepository: NotificationRepository;

  public readonly tokenManager: TokenManager;
  public readonly emailManager: EmailManager;
  public readonly objectStorage: ObjectStorage;

  public constructor(
    module: TestingModule,
    contextId: ContextId,
    app: INestApplication,
    session: Session,
    unitOfWork: UnitOfWork,
    userRepository: UserRepositoryStrategy,
    projectRepository: ProjectRepository,
    notificationRepository: NotificationRepository,
    tokenManager: TokenManager,
    emailManager: EmailManager,
    objectStorage: ObjectStorage,
  ) {
    super(module, contextId);
    this.app = app;
    this.session = session;
    this.unitOfWork = unitOfWork;
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.notificationRepository = notificationRepository;
    this.tokenManager = tokenManager;
    this.emailManager = emailManager;
    this.objectStorage = objectStorage;
  }

  public static async create(): Promise<IntegrationTestScenario> {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = await module.createNestApplication().init();
    const session = request.agent(app.getHttpServer());
    const contextId = ContextIdFactory.create();
    return new IntegrationTestScenario(
      module,
      contextId,
      app,
      session,
      await module.resolve(UnitOfWork, contextId, { strict: false }),
      module.get(UserRepositoryStrategy),
      module.get(ProjectRepository),
      await module.resolve(NotificationRepository, contextId, {
        strict: false,
      }),
      module.get(TokenManager),
      module.get(EmailManager),
      module.get(ObjectStorage),
    );
  }

  public async teardown(): Promise<void> {
    await this.app.close();
  }

  public async authenticateUser(user: User): Promise<void> {
    const loginToken = this.tokenManager.newLoginToken(
      user.email,
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

  public async createNotification(owner: ReadonlyUser): Promise<Notification> {
    const project = this.modelFaker.notification(owner.id);
    this.unitOfWork.registerNew(project);
    await this.unitOfWork.commit();
    return project;
  }

  /**
   *
   */
  public async sleep(millis: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, millis));
  }
}
