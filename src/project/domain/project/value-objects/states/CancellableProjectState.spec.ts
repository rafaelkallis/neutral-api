import { User } from 'user/domain/User';
import { Project } from 'project/domain/project/Project';
import { ModelFaker } from 'test/ModelFaker';
import { CancelledProjectState } from './CancelledProjectState';
import { ProjectCancelledEvent } from 'project/domain/events/ProjectCancelledEvent';
import { CancellableProjectState } from 'project/domain/project/value-objects/states/CancellableProjectState';
import { ProjectState } from './ProjectState';

describe('' + CancellableProjectState.name, () => {
  let modelFaker: ModelFaker;

  let cancellableState: ProjectState;
  let creator: User;
  let project: Project;

  class ChildState extends CancellableProjectState {
    public getOrdinal(): number {
      throw new Error();
    }
  }

  beforeEach(() => {
    modelFaker = new ModelFaker();

    cancellableState = new ChildState();
    creator = modelFaker.user();
    project = modelFaker.project(creator.id);
  });

  describe('cancel', () => {
    test('happy path', () => {
      cancellableState.cancel(project);
      expect(project.state.equals(CancelledProjectState.INSTANCE)).toBeTruthy();
      expect(project.domainEvents).toContainEqual(
        expect.any(ProjectCancelledEvent),
      );
    });
  });
});
