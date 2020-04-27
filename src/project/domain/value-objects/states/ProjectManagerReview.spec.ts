import { User } from 'user/domain/User';
import { Project } from 'project/domain/Project';
import { ModelFaker } from 'test/ModelFaker';
import { ProjectFinished } from 'project/domain/value-objects/states/ProjectFinished';
import { ProjectState } from 'project/domain/value-objects/states/ProjectState';
import { ProjectManagerReview } from 'project/domain/value-objects/states/ProjectManagerReview';
import { ProjectManagerReviewFinishedEvent } from 'project/domain/events/ProjectManagerReviewFinishedEvent';

describe(ProjectManagerReview.name, () => {
  let modelFaker: ModelFaker;

  let state: ProjectState;
  let creator: User;
  let project: Project;

  beforeEach(() => {
    modelFaker = new ModelFaker();

    state = ProjectManagerReview.INSTANCE;
    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
  });

  describe('submit manager review', () => {
    test('happy path', () => {
      state.submitManagerReview(project);
      expect(project.state).toBe(ProjectFinished.INSTANCE);
      expect(project.domainEvents).toContainEqual(
        expect.any(ProjectManagerReviewFinishedEvent),
      );
    });
  });
});
