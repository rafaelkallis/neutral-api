import td from 'testdouble';
import { NotificationDomainEventHandlers } from 'notification/application/NotificationDomainEventHandlers';
import { NotificationFactoryService } from 'notification/domain/NotificationFactoryService';
import { Notification } from 'notification/domain/Notification';
import { PeerReviewStartedEvent } from 'project/domain/milestone/events/PeerReviewStartedEvent';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { UserAssignedEvent } from 'project/domain/events/UserAssignedEvent';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ManagerReviewStartedEvent } from 'project/domain/milestone/events/ManagerReviewStartedEvent';
import { MilestoneFinishedEvent } from 'project/domain/milestone/events/MilestoneFinishedEvent';

describe('' + NotificationDomainEventHandlers.name, () => {
  let scenario: UnitTestScenario<NotificationDomainEventHandlers>;
  let notificationDomainEventHandler: NotificationDomainEventHandlers;
  let notificationRepository: NotificationRepository;
  let notificationFactory: NotificationFactoryService;
  let notification: Notification;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(NotificationDomainEventHandlers)
      .addProviderMock(NotificationRepository)
      .addProviderMock(NotificationFactoryService)
      .build();
    notificationDomainEventHandler = scenario.subject;
    notificationRepository = scenario.module.get(NotificationRepository);
    notificationFactory = scenario.module.get(NotificationFactoryService);
    notification = td.object();
  });

  test('existing user assigned', async () => {
    const owner = scenario.modelFaker.user();
    const project = scenario.modelFaker.project(owner.id);
    const assignee = scenario.modelFaker.user();
    const role = scenario.modelFaker.role(assignee.id);
    const event = new UserAssignedEvent(project, role, assignee);
    td.when(
      notificationFactory.createNewAssignmentNotification(project, role),
    ).thenReturn(notification);

    await notificationDomainEventHandler.onUserAssignedCreateNewAssignmentNotification(
      event,
    );

    td.verify(notificationRepository.persist(notification));
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
    const milestone = scenario.modelFaker.milestone(project);
    project.milestones.add(milestone);
    const event = new PeerReviewStartedEvent(milestone);
    td.when(
      notificationFactory.createPeerReviewRequestedNotification(
        project,
        td.matchers.anything(),
      ),
    ).thenReturn(notification);

    await notificationDomainEventHandler.onPeerReviewStartedCreatePeerReviewRequestedNotifications(
      event,
    );

    td.verify(
      notificationRepository.persist(notification, notification, notification),
    );
    // TODO: more assertions
  });

  test('manager review requested', async () => {
    const owner = scenario.modelFaker.user();
    const project = scenario.modelFaker.project(owner.id);
    const milestone = scenario.modelFaker.milestone(project);
    const event = new ManagerReviewStartedEvent(milestone);
    td.when(
      notificationFactory.createManagerReviewRequestedNotification(project),
    ).thenReturn(notification);

    await notificationDomainEventHandler.onManagerReviewStartedCreateManagerReviewRequestedNotification(
      event,
    );

    td.verify(notificationRepository.persist(notification));
  });

  test('milestone finished', async () => {
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
    const milestone = scenario.modelFaker.milestone(project);
    project.milestones.add(milestone);
    const event = new MilestoneFinishedEvent(milestone);

    td.when(
      notificationFactory.createMilestoneFinishedNotification(
        event.milestone.project,
        td.matchers.anything(),
      ),
    ).thenReturn(notification);

    await notificationDomainEventHandler.onMilestoneFinishedCreateProjectFinishedNotification(
      event,
    );

    td.verify(
      notificationRepository.persist(
        notification,
        notification,
        notification,
        notification,
      ),
    );
    // TODO: more assertions
  });
});
