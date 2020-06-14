import { NotificationDomainEventHandlers } from 'notification/application/NotificationDomainEventHandlers';
import { NotificationFactoryService } from 'notification/domain/NotificationFactoryService';
import { ProjectPeerReviewStartedEvent } from 'project/domain/events/ProjectPeerReviewStartedEvent';
import { ProjectManagerReviewStartedEvent } from 'project/domain/events/ProjectManagerReviewStartedEvent';
import { ProjectFinishedEvent } from 'project/domain/events/ProjectFinishedEvent';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { UserAssignedEvent } from 'project/domain/events/UserAssignedEvent';
import { UserCollection } from 'user/domain/UserCollection';
import { UnitTestScenario } from 'test/UnitTestScenario';

describe(NotificationDomainEventHandlers.name, () => {
  let scenario: UnitTestScenario<NotificationDomainEventHandlers>;
  let notificationRepository: NotificationRepository;
  let notificationFactory: NotificationFactoryService;
  let notificationDomainEventHandler: NotificationDomainEventHandlers;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(NotificationDomainEventHandlers)
      .addProviderMock(NotificationRepository)
      .addProviderMock(NotificationFactoryService)
      .build();
    notificationRepository = scenario.module.get(NotificationRepository);
    notificationFactory = scenario.module.get(NotificationFactoryService);
    notificationDomainEventHandler = new NotificationDomainEventHandlers(
      notificationRepository,
      notificationFactory,
    );
  });

  test('existing user assigned', async () => {
    const owner = scenario.modelFaker.user();
    const project = scenario.modelFaker.project(owner.id);
    const assignee = scenario.modelFaker.user();
    const role = scenario.modelFaker.role(assignee.id);
    const event = new UserAssignedEvent(project, role, assignee);

    await notificationDomainEventHandler.onUserAssignedCreateNewAssignmentNotification(
      event,
    );

    // TODO assertions
  });

  test('peer review requested', async () => {
    const owner = scenario.modelFaker.user();
    const project = scenario.modelFaker.project(owner.id);
    const assignees = [
      scenario.modelFaker.user(),
      scenario.modelFaker.user(),
      scenario.modelFaker.user(),
    ];
    project.roles.addAll([
      scenario.modelFaker.role(assignees[0].id),
      scenario.modelFaker.role(assignees[1].id),
      scenario.modelFaker.role(assignees[2].id),
    ]);
    const event = new ProjectPeerReviewStartedEvent(
      project,
      new UserCollection(assignees),
    );

    await notificationDomainEventHandler.onPeerReviewStartedCreatePeerReviewRequestedNotifications(
      event,
    );

    // TODO: assertions
  });

  test('manager review requested', async () => {
    const owner = scenario.modelFaker.user();
    const project = scenario.modelFaker.project(owner.id);
    const event = new ProjectManagerReviewStartedEvent(project);

    await notificationDomainEventHandler.onManagerReviewStartedCreateManagerReviewRequestedNotification(
      event,
    );

    // TODO assertions
  });

  test('project finished', async () => {
    const owner = scenario.modelFaker.user();
    const project = scenario.modelFaker.project(owner.id);
    const assignees = [
      scenario.modelFaker.user(),
      scenario.modelFaker.user(),
      scenario.modelFaker.user(),
    ];
    project.roles.addAll([
      scenario.modelFaker.role(assignees[0].id),
      scenario.modelFaker.role(assignees[1].id),
      scenario.modelFaker.role(assignees[2].id),
    ]);
    const event = new ProjectFinishedEvent(project);

    await notificationDomainEventHandler.onProjectFinishedCreateProjectFinishedNotification(
      event,
    );
    // TODO: assertions
  });
});
