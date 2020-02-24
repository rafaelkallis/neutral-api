import { NotificationFakeRepository } from 'notification/infrastructure/NotificationFakeRepository';
import { ModelFaker } from 'test';
import { NotificationSagasService } from 'notification/application/NotificationSagasService';
import { NotificationFactoryService } from 'notification/domain/NotificationFactoryService';
import { ExistingUserAssignedEvent } from 'project/domain/events/ExistingUserAssignedEvent';
import { NotificationType } from 'notification/domain/value-objects/NotificationType';
import { ProjectPeerReviewStartedEvent } from 'project/domain/events/ProjectPeerReviewStartedEvent';
import { ProjectManagerReviewStartedEvent } from 'project/domain/events/ProjectManagerReviewStartedEvent';
import { ProjectFinishedEvent } from 'project/domain/events/ProjectFinishedEvent';

describe('notification sagas', () => {
  let modelFaker: ModelFaker;
  let notificationRepository: NotificationFakeRepository;
  let notificationFactory: NotificationFactoryService;
  let notificationSagas: NotificationSagasService;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    notificationRepository = new NotificationFakeRepository();
    notificationFactory = new NotificationFactoryService();
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
    const owner = modelFaker.user();
    const project = modelFaker.project(owner.id);
    const assignee = modelFaker.user();
    const role = modelFaker.role(project.id, assignee.id);
    const event = new ExistingUserAssignedEvent(project, role);

    await notificationSagas.existingUserAssigned(event);

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
    project.roles.add(
      modelFaker.role(project.id, assignees[0].id),
      modelFaker.role(project.id, assignees[1].id),
      modelFaker.role(project.id, assignees[2].id),
    );
    const event = new ProjectPeerReviewStartedEvent(project);

    await notificationSagas.peerReviewStarted(event);

    expect(notificationRepository.persist).toHaveBeenCalled();
    // TODO: more assertions
  });

  test('manager review requested', async () => {
    const owner = modelFaker.user();
    const project = modelFaker.project(owner.id);
    const event = new ProjectManagerReviewStartedEvent(project);

    await notificationSagas.managerReviewStarted(event);

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
    project.roles.add(
      modelFaker.role(project.id, assignees[0].id),
      modelFaker.role(project.id, assignees[1].id),
      modelFaker.role(project.id, assignees[2].id),
    );
    const event = new ProjectFinishedEvent(project);

    await notificationSagas.handleProjectFinished(event);

    expect(notificationRepository.persist).toHaveBeenCalled();
    // TODO: more assertions
  });
});