import { User } from 'user/domain/User';
import { Project } from 'project/domain/project/Project';
import { ModelFaker } from 'test/ModelFaker';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import { ProjectState } from 'project/domain/project/value-objects/states/ProjectState';
import { ManagerReviewProjectState } from 'project/domain/project/value-objects/states/ManagerReviewProjectState';
import { ProjectManagerReviewFinishedEvent } from 'project/domain/events/ProjectManagerReviewFinishedEvent';

describe(ManagerReviewProjectState.name, () => {
  let modelFaker: ModelFaker;

  let state: ProjectState;
  let creator: User;
  let project: Project;

  beforeEach(() => {
    modelFaker = new ModelFaker();

    state = ManagerReviewProjectState.INSTANCE;
    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
  });

  test('happy path', () => {
    state.submitManagerReview(project);
    expect(project.state).toBe(FinishedProjectState.INSTANCE);
    expect(project.domainEvents).toContainEqual(
      expect.any(ProjectManagerReviewFinishedEvent),
    );
  });
});
