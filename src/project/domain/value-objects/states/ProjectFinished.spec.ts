import { User } from 'user/domain/User';
import { Project } from 'project/domain/Project';
import { ProjectArchivedEvent } from 'project/domain/events/ProjectArchivedEvent';
import { ModelFaker } from 'test/ModelFaker';
import { ProjectFinished } from 'project/domain/value-objects/states/ProjectFinished';
import { ProjectArchived } from 'project/domain/value-objects/states/ProjectArchived';
import { ProjectState } from 'project/domain/value-objects/states/ProjectState';

describe(ProjectFinished.name, () => {
  let modelFaker: ModelFaker;

  let state: ProjectState;
  let creator: User;
  let project: Project;

  beforeEach(() => {
    modelFaker = new ModelFaker();

    state = ProjectFinished.INSTANCE;
    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
  });

  describe('archive', () => {
    test('happy path', () => {
      state.archive(project);
      expect(project.state).toBe(ProjectArchived.INSTANCE);
      expect(project.domainEvents).toEqual([expect.any(ProjectArchivedEvent)]);
    });
  });
});
