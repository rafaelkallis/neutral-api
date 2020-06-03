import { NotificationDomainEventHandlers } from 'notification/application/NotificationDomainEventHandlers';
import { NotificationFactoryService } from 'notification/domain/NotificationFactoryService';
import { NotificationType } from 'notification/domain/value-objects/NotificationType';
import { ProjectPeerReviewStartedEvent } from 'project/domain/events/ProjectPeerReviewStartedEvent';
import { ProjectManagerReviewStartedEvent } from 'project/domain/events/ProjectManagerReviewStartedEvent';
import { ProjectFinishedEvent } from 'project/domain/events/ProjectFinishedEvent';
import { ModelFaker } from 'test/ModelFaker';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { MemoryNotificationRepository } from 'notification/infrastructure/MemoryNotificationRepository';
import { UserAssignedEvent } from 'project/domain/events/UserAssignedEvent';
import { UserCollection } from 'user/domain/UserCollection';

describe('notification sagas', () => {
  let modelFaker: ModelFaker;
  let notificationRepository: NotificationRepository;
  let notificationFactory: NotificationFactoryService;
  let notificationDomainEventHandler: NotificationDomainEventHandlers;

  beforeEach(() => {
    modelFaker = new ModelFaker();
    notificationRepository = new MemoryNotificationRepository();
    notificationFactory = new NotificationFactoryService();
    notificationDomainEventHandler = new NotificationDomainEventHandlers(
      notificationRepository,
      notificationFactory,
    );
    jest.spyOn(notificationRepository, 'persist');
  });

  test('should be defined', () => {
    expect(notificationDomainEventHandler).toBeDefined();
  });

  test('existing user assigned', async () => {
    const owner = modelFaker.user();
    const project = modelFaker.project(owner.id);
    const assignee = modelFaker.user();
    const role = modelFaker.role(assignee.id);
    const event = new UserAssignedEvent(project, role, assignee);

    await notificationDomainEventHandler.onUserAssignedCreateNewAssignmentNotification(
      event,
    );

    expect(notificationRepository.persist).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.NEW_ASSIGNMENT,
      }),
    );
  });

  test('peer review requested', async () => {
    const owner = modelFaker.user();
    const project = modelFaker.project(owner.id);
    const assignees = [modelFaker.user(), modelFaker.user(), modelFaker.user()];
    project.roles.addAll([
      modelFaker.role(assignees[0].id),
      modelFaker.role(assignees[1].id),
      modelFaker.role(assignees[2].id),
    ]);
    const event = new ProjectPeerReviewStartedEvent(
      project,
      new UserCollection(assignees),
    );

    await notificationDomainEventHandler.onPeerReviewStartedCreatePeerReviewRequestedNotifications(
      event,
    );

    expect(notificationRepository.persist).toHaveBeenCalled();
    // TODO: more assertions
  });

  test('manager review requested', async () => {
    const owner = modelFaker.user();
    const project = modelFaker.project(owner.id);
    const event = new ProjectManagerReviewStartedEvent(project);

    await notificationDomainEventHandler.onManagerReviewStartedCreateManagerReviewRequestedNotification(
      event,
    );

    expect(notificationRepository.persist).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.MANAGER_REVIEW_REQUESTED,
      }),
    );
  });

  test('project finished', async () => {
    const owner = modelFaker.user();
    const project = modelFaker.project(owner.id);
    const assignees = [modelFaker.user(), modelFaker.user(), modelFaker.user()];
    project.roles.addAll([
      modelFaker.role(assignees[0].id),
      modelFaker.role(assignees[1].id),
      modelFaker.role(assignees[2].id),
    ]);
    const event = new ProjectFinishedEvent(project);

    await notificationDomainEventHandler.onProjectFinishedCreateProjectFinishedNotification(
      event,
    );

    expect(notificationRepository.persist).toHaveBeenCalled();
    // TODO: more assertions
  });
});
