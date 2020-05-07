import { User } from 'user/domain/User';
import { Project } from 'project/domain/project/Project';
import { ModelFaker } from 'test/ModelFaker';
import {
  ProjectState,
  DefaultProjectState,
} from 'project/domain/project/value-objects/states/ProjectState';
import { ProjectCancelled } from './ProjectCancelled';
import { ProjectCancelledEvent } from 'project/domain/events/ProjectCancelledEvent';
import { CancellableProjectState } from 'project/domain/project/value-objects/states/CancellableProjectState';

describe(CancellableProjectState.name, () => {
  let modelFaker: ModelFaker;

  let baseState: ProjectState;
  let cancellableState: ProjectState;
  let creator: User;
  let project: Project;

  class BaseState extends DefaultProjectState {
    public cancel(_project: Project): void {
      throw new Error();
    }
  }

  beforeEach(() => {
    modelFaker = new ModelFaker();

    baseState = new BaseState();
    cancellableState = new CancellableProjectState(baseState);
    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
  });

  describe('cancel', () => {
    test('happy path', () => {
      cancellableState.cancel(project);
      expect(project.state.equals(ProjectCancelled.INSTANCE)).toBeTruthy();
      expect(project.domainEvents).toContainEqual(
        expect.any(ProjectCancelledEvent),
      );
    });
  });
});
