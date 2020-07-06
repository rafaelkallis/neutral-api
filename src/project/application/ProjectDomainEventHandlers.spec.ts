import td from 'testdouble';
import { Project } from 'project/domain/project/Project';
import { Role } from 'project/domain/role/Role';
import { InternalUser } from 'user/domain/User';
import { UserRepository } from 'user/domain/UserRepository';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { MagicLinkFactory } from 'shared/urls/MagicLinkFactory';
import { PendingState } from 'user/domain/value-objects/states/PendingState';
import { TokenManager } from 'shared/token/application/TokenManager';
import { ProjectDomainEventHandlers } from './ProjectDomainEventHandlers';
import { Config } from 'shared/config/application/Config';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { UserAssignedEvent } from 'project/domain/events/UserAssignedEvent';

describe(ProjectDomainEventHandlers.name, () => {
  let scenario: UnitTestScenario<ProjectDomainEventHandlers>;
  let projectDomainEventHandlers: ProjectDomainEventHandlers;
  let project: Project;
  let emailManager: EmailManager;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(ProjectDomainEventHandlers)
      .addProviderMock(Config)
      .addProviderMock(EmailManager)
      .addProviderMock(UserRepository)
      .addProviderMock(TokenManager)
      .addProviderMock(MagicLinkFactory)
      .build();
    projectDomainEventHandlers = scenario.subject;
    emailManager = scenario.module.get(EmailManager);
    const config = scenario.module.get(Config);
    td.when(config.get('FRONTEND_URL')).thenReturn('');

    const creator = scenario.modelFaker.user();
    project = scenario.modelFaker.project(creator.id);
  });

  describe('on user assigned send assignment email', () => {
    let assignee: InternalUser;
    let role: Role;
    let tokenManager: TokenManager;
    let loginToken: string;
    let magicLinkFactory: MagicLinkFactory;
    let loginLink: string;

    beforeEach(() => {
      assignee = scenario.modelFaker.user();
      role = scenario.modelFaker.role();
      project.roles.add(role);
      tokenManager = scenario.module.get(TokenManager);
      loginToken = td.object();
      td.when(
        tokenManager.newLoginToken(assignee.email, assignee.lastLoginAt),
      ).thenReturn(loginToken);
      magicLinkFactory = scenario.module.get(MagicLinkFactory);
      loginLink = td.object();
      td.when(
        magicLinkFactory.createLoginLink({
          loginToken,
          email: assignee.email,
          isNew: true,
        }),
      ).thenReturn(loginLink);
    });

    test('pending user', async () => {
      assignee.state = PendingState.getInstance();
      const event = new UserAssignedEvent(project, role, assignee);
      await projectDomainEventHandlers.onUserAssignedSendAssignmentEmail(event);
      td.verify(
        emailManager.sendPendingUserNewAssignmentEmail(assignee.email.value, {
          projectTitle: project.title.value,
          roleTitle: role.title.value,
          signupMagicLink: loginLink,
        }),
      );
    });

    test('active user', async () => {
      const event = new UserAssignedEvent(project, role, assignee);
      await projectDomainEventHandlers.onUserAssignedSendAssignmentEmail(event);
      td.verify(
        emailManager.sendNewAssignmentEmail(assignee.email.value, {
          projectTitle: project.title.value,
          roleTitle: role.title.value,
          projectUrl: td.matchers.isA(String),
        }),
      );
    });
  });
});
