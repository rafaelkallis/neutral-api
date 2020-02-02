import { FakeNotificationRepository } from 'notification/repositories/fake-notification.repository';
import { EntityFaker } from 'test';
import { NotificationSagasService } from 'notification/services/notification-sagas.service';
import { NotificationFactoryService } from 'notification/services/notification-factory.service';
import { ExistingUserAssignedEvent } from 'role/events/existing-user-assigned.event';
import { NotificationType } from 'notification/notification';
import { ProjectPeerReviewStartedEvent } from 'project/domain/events/ProjectPeerReviewStartedEvent';
import { ProjectManagerReviewStartedEvent } from 'project/domain/events/ProjectManagerReviewStartedEvent';
import { ProjectFinishedEvent } from 'project/domain/events/ProjectFinishedEvent';

describe('notification sagas', () => {
  let entityFaker: EntityFaker;
  let notificationRepository: FakeNotificationRepository;
  let notificationFactory: NotificationFactoryService;
  let notificationSagas: NotificationSagasService;

  beforeEach(async () => {
    entityFaker = new EntityFaker();
    notificationRepository = new FakeNotificationRepository();
    notificationFactory = new NotificationFactoryService(
      notificationRepository,
    );
    notificationSagas = new NotificationSagasService(
      notificationRepository,
      notificationFactory,
    );
    jest.spyOn(notificationRepository, 'persist');
  });

  test('should be defined', () => {
    expect(notificationSagas).toBeDefined();
  });

  test('existing user assigned', async () => {
    const owner = entityFaker.user();
    const project = entityFaker.project(owner.id);
    const assignee = entityFaker.user();
    const role = entityFaker.role(project.id, assignee.id);
    const event = new ExistingUserAssignedEvent(project, role);

    await notificationSagas.existingUserAssigned(event);

    expect(notificationRepository.persist).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: role.assigneeId,
        type: NotificationType.NEW_ASSIGNMENT,
        payload: {
          project: {
            id: project.id,
            title: project.title,
          },
          role: {
            id: role.id,
            title: role.title,
          },
        },
      }),
    );
  });

  test('peer review requested', async () => {
    const owner = entityFaker.user();
    const project = entityFaker.project(owner.id);
    const assignees = [
      entityFaker.user(),
      entityFaker.user(),
      entityFaker.user(),
    ];
    const roles = [
      entityFaker.role(project.id, assignees[0].id),
      entityFaker.role(project.id, assignees[1].id),
      entityFaker.role(project.id, assignees[2].id),
    ];
    const event = new ProjectPeerReviewStartedEvent(project, roles);

    await notificationSagas.peerReviewStarted(event);

    expect(notificationRepository.persist).toHaveBeenCalled();
    // TODO: more assertions
  });

  test('manager review requested', async () => {
    const owner = entityFaker.user();
    const project = entityFaker.project(owner.id);
    const event = new ProjectManagerReviewStartedEvent(project);

    await notificationSagas.managerReviewStarted(event);

    expect(notificationRepository.persist).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: project.creatorId,
        type: NotificationType.MANAGER_REVIEW_REQUESTED,
        payload: {
          project: {
            id: project.id,
            title: project.title,
          },
        },
      }),
    );
  });

  test('project finished', async () => {
    const owner = entityFaker.user();
    const project = entityFaker.project(owner.id);
    const assignees = [
      entityFaker.user(),
      entityFaker.user(),
      entityFaker.user(),
    ];
    const roles = [
      entityFaker.role(project.id, assignees[0].id),
      entityFaker.role(project.id, assignees[1].id),
      entityFaker.role(project.id, assignees[2].id),
    ];
    const event = new ProjectFinishedEvent(project, roles);

    await notificationSagas.projectFinished(event);

    expect(notificationRepository.persist).toHaveBeenCalled();
    // TODO: more assertions
  });
});
