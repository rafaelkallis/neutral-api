import { User } from 'user/domain/User';
import { Project } from 'project/domain/project/Project';
import { ModelFaker } from 'test/ModelFaker';
import { ManagerReviewMilestoneState } from 'project/domain/milestone/value-objects/states/ManagerReviewMilestoneState';
import { MilestoneState } from './MilestoneState';
import { Milestone } from '../../Milestone';
import { FinishedMilestoneState } from './FinishedMilestoneState';
import { ManagerReviewFinishedEvent } from 'project/domain/milestone/events/ProjectManagerReviewFinishedEvent';

describe('' + ManagerReviewMilestoneState.name, () => {
  let modelFaker: ModelFaker;

  let state: MilestoneState;
  let creator: User;
  let project: Project;
  let milestone: Milestone;

  beforeEach(() => {
    modelFaker = new ModelFaker();

    state = ManagerReviewMilestoneState.INSTANCE;
    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
    milestone = modelFaker.milestone(project);
  });

  test('happy path', () => {
    state.submitManagerReview(milestone);
    expect(milestone.state).toBe(FinishedMilestoneState.INSTANCE);
    expect(project.domainEvents).toContainEqual(
      expect.any(ManagerReviewFinishedEvent),
    );
  });
});
