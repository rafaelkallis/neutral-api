import td from 'testdouble';
import { Project } from 'project/domain/project/Project';
import { Role } from 'project/domain/role/Role';
import { InternalUser } from 'user/domain/User';
import { UserRepository } from 'user/domain/UserRepository';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ProjectDomainEventHandlers } from './ProjectDomainEventHandlers';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { UserAssignedEvent } from 'project/domain/events/UserAssignedEvent';
import { CtaUrlFactory } from 'shared/urls/CtaUrlFactory';

describe(ProjectDomainEventHandlers.name, () => {
  let scenario: UnitTestScenario<ProjectDomainEventHandlers>;
  let projectDomainEventHandlers: ProjectDomainEventHandlers;
  let project: Project;
  let emailManager: EmailManager;
  let ctaUrlFactory: CtaUrlFactory;
  let ctaUrl: string;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(ProjectDomainEventHandlers)
      .addProviderMock(EmailManager)
      .addProviderMock(UserRepository)
      .addProviderMock(CtaUrlFactory)
      .build();
    projectDomainEventHandlers = scenario.subject;
    emailManager = scenario.module.get(EmailManager);
    ctaUrlFactory = scenario.module.get(CtaUrlFactory);
    ctaUrl = td.object();

    const creator = scenario.modelFaker.user();
    project = scenario.modelFaker.project(creator.id);
  });

  describe('on user assigned send assignment email', () => {
    let assignee: InternalUser;
    let role: Role;

    beforeEach(() => {
      assignee = scenario.modelFaker.user();
      role = scenario.modelFaker.role();
      project.roles.add(role);
      td.when(
        ctaUrlFactory.createnewAssignmentCtaUrl({
          user: assignee,
          projectId: project.id,
        }),
      ).thenReturn(ctaUrl);
    });

    test('happy path', async () => {
      const event = new UserAssignedEvent(project, role, assignee);
      await projectDomainEventHandlers.onUserAssignedSendAssignmentEmail(event);
      td.verify(
        emailManager.sendNewAssignmentEmail(assignee.email.value, {
          firstName: assignee.name.first,
          projectTitle: project.title.value,
          roleTitle: role.title.value,
          ctaUrl: ctaUrl,
        }),
      );
    });
  });
});
