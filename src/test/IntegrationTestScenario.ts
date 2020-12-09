import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'app/AppModule';
import { UserRepository } from 'user/domain/UserRepository';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { User, ReadonlyUser } from 'user/domain/User';
import { TokenManager } from 'shared/token/application/TokenManager';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { Project } from 'project/domain/project/Project';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { TestScenario } from 'test/TestScenario';
import mailhog from 'mailhog';
import { Email } from 'user/domain/value-objects/Email';
import { OrganizationRepository } from 'organization/domain/OrganizationRepository';
import { Organization } from 'organization/domain/Organization';

type Session = request.SuperAgentTest;

export class IntegrationTestScenario extends TestScenario {
  public readonly app: INestApplication;
  public readonly userRepository: UserRepository;
  public readonly projectRepository: ProjectRepository;
  public readonly notificationRepository: NotificationRepository;
  public readonly organizationRepository: OrganizationRepository;

  public readonly tokenManager: TokenManager;
  public readonly emailManager: EmailManager;
  public readonly objectStorage: ObjectStorage;

  public readonly session: Session;
  public readonly mailhogClient: mailhog.API;

  public constructor(
    app: INestApplication,
    module: TestingModule,
    userRepository: UserRepository,
    projectRepository: ProjectRepository,
    notificationRepository: NotificationRepository,
    organizationRepository: OrganizationRepository,
    tokenManager: TokenManager,
    emailManager: EmailManager,
    objectStorage: ObjectStorage,
    session: Session,
    mailhogClient: mailhog.API,
  ) {
    super(module);
    this.app = app;
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.notificationRepository = notificationRepository;
    this.organizationRepository = organizationRepository;
    this.tokenManager = tokenManager;
    this.emailManager = emailManager;
    this.objectStorage = objectStorage;
    this.session = session;
    this.mailhogClient = mailhogClient;
  }

  public static async create(): Promise<IntegrationTestScenario> {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = await module.createNestApplication().init();
    const session = request.agent(app.getHttpServer());
    const mailhogClient = mailhog();
    return new IntegrationTestScenario(
      app,
      module,
      module.get(UserRepository),
      module.get(ProjectRepository),
      module.get(NotificationRepository),
      module.get(OrganizationRepository),
      module.get(TokenManager),
      module.get(EmailManager),
      module.get(ObjectStorage),
      session,
      mailhogClient,
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
    const response = await this.session.post(`/auth/login/${loginToken}`);
    const { accessToken }: { accessToken: string } = response.body;
    await this.session.set('Authorization', `Bearer ${accessToken}`);
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

  public async createOrganization(owner: ReadonlyUser): Promise<Organization> {
    const organization = this.modelFaker.organization(owner.id);
    await this.organizationRepository.persist(organization);
    return organization;
  }

  /**
   *
   */
  public async sleep(millis: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, millis));
  }

  public async getReceivedEmails(
    userOrEmail: ReadonlyUser | Email,
  ): Promise<mailhog.Message[]> {
    const email =
      userOrEmail instanceof Email ? userOrEmail : userOrEmail.email;
    const messages = await this.mailhogClient.search(email.value, 'to');
    return messages.items;
  }
}
