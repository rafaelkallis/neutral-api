import { Project } from 'project/domain/project/Project';
import { ModelFaker } from 'test/ModelFaker';
import { ActiveProjectState } from './ActiveProjectState';
import { MilestoneTitle } from 'project/domain/milestone/value-objects/MilestoneTitle';
import { MilestoneDescription } from 'project/domain/milestone/value-objects/MilestoneDescription';
import { ValueObjectFaker } from 'test/ValueObjectFaker';
import { MilestoneCreatedEvent } from 'project/domain/milestone/events/MilestoneCreatedEvent';
import { PeerReviewStartedEvent } from 'project/domain/milestone/events/PeerReviewStartedEvent';
import { ProjectTestHelper } from 'test/ProjectTestHelper';
import { UserCollection } from 'user/domain/UserCollection';
import { ArchivedProjectState } from './ArchivedProjectState';
import { ProjectArchivedEvent } from 'project/domain/events/ProjectArchivedEvent';
import { FinishedMilestoneState } from 'project/domain/milestone/value-objects/states/FinishedMilestoneState';

describe('' + ActiveProjectState.name, () => {
  let modelFaker: ModelFaker;
  let valueObjectFaker: ValueObjectFaker;

  let project: Project;
  let projectHelper: ProjectTestHelper;

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    valueObjectFaker = new ValueObjectFaker();
    const creator = modelFaker.user();
    project = modelFaker.project(creator.id);
    projectHelper = ProjectTestHelper.of(project);
    const assignees = new UserCollection([
      modelFaker.user(),
      modelFaker.user(),
      modelFaker.user(),
      modelFaker.user(),
    ]);
    projectHelper.addRolesAndAssign(assignees);
    projectHelper.addReviewTopics(2);
    project.finishFormation();
    if (project.state !== ActiveProjectState.INSTANCE) {
      throw new Error('project should be in active state');
    }
    projectHelper.addMilestone();
    await projectHelper.completePeerReviews();
    project.submitManagerReview();
    if (project.latestMilestone.state !== FinishedMilestoneState.INSTANCE) {
      throw new Error('latest milestone should be in finished state');
    }
  });

  describe('add milestone', () => {
    let title: MilestoneTitle;
    let description: MilestoneDescription;

    beforeEach(() => {
      title = valueObjectFaker.milestone.title();
      description = valueObjectFaker.milestone.description();
    });

    test('happy path', () => {
      ActiveProjectState.INSTANCE.addMilestone(project, title, description);
      expect(project.milestones).toHaveLength(2);
      expect(project.domainEvents).toContainEqual(
        expect.any(MilestoneCreatedEvent),
      );
      expect(project.domainEvents).toContainEqual(
        expect.any(PeerReviewStartedEvent),
      );
    });

    test('when milestone pending should fail', () => {
      const milestone = projectHelper.addMilestone();
      expect(() =>
        ActiveProjectState.INSTANCE.addMilestone(project, title, description),
      ).toThrow();
      expect(project.milestones).toHaveLength(2);
      expect(project.latestMilestone).toBe(milestone);
    });
  });

  describe('archive', () => {
    test('happy path', () => {
      ActiveProjectState.INSTANCE.archive(project);
      expect(project.state).toBe(ArchivedProjectState.INSTANCE);
      expect(project.domainEvents).toContainEqual(
        expect.any(ProjectArchivedEvent),
      );
    });

    test('when milestone pending should fail', () => {
      projectHelper.addMilestone();
      expect(() => ActiveProjectState.INSTANCE.archive(project)).toThrowError();
      expect(project.state).toBe(ActiveProjectState.INSTANCE);
    });
  });
});
