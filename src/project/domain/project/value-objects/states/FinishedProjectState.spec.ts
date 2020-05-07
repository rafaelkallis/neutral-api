import { User } from 'user/domain/User';
import { Project } from 'project/domain/project/Project';
import { ProjectArchivedEvent } from 'project/domain/events/ProjectArchivedEvent';
import { ModelFaker } from 'test/ModelFaker';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import { ArchivedProjectState } from 'project/domain/project/value-objects/states/ArchivedProjectState';
import { ProjectState } from 'project/domain/project/value-objects/states/ProjectState';

describe(FinishedProjectState.name, () => {
  let modelFaker: ModelFaker;

  let state: ProjectState;
  let creator: User;
  let project: Project;

  beforeEach(() => {
    modelFaker = new ModelFaker();

    state = FinishedProjectState.INSTANCE;
    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
  });

  describe('archive', () => {
    test('happy path', () => {
      state.archive(project);
      expect(project.state).toBe(ArchivedProjectState.INSTANCE);
      expect(project.domainEvents).toEqual([expect.any(ProjectArchivedEvent)]);
    });
  });
});
