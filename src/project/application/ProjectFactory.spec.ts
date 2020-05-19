import { ReadonlyUser } from 'user/domain/User';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/project/value-objects/ProjectDescription';
import { ProjectCreatedEvent } from 'project/domain/events/ProjectCreatedEvent';
import { ProjectFormationStartedEvent } from 'project/domain/events/ProjectFormationStartedEvent';
import { ProjectFactory } from 'project/application/ProjectFactory';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { UnitOfWork } from 'shared/domain/unit-of-work/UnitOfWork';

describe(ProjectFactory.name, () => {
  let scenario: UnitTestScenario<ProjectFactory>;
  let projectFactory: ProjectFactory;

  let creator: ReadonlyUser;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(ProjectFactory)
      .addProviderMock(UnitOfWork)
      .build();
    projectFactory = scenario.subject;
    creator = scenario.modelFaker.user();
  });

  describe('create project', () => {
    let title: ProjectTitle;
    let description: ProjectDescription;

    beforeEach(() => {
      title = ProjectTitle.from(scenario.primitiveFaker.words());
      description = ProjectDescription.from(
        scenario.primitiveFaker.paragraph(),
      );
    });

    test('happy path', () => {
      const createdProject = projectFactory.create({
        title,
        description,
        creator,
      });
      expect(createdProject.domainEvents).toEqual([
        expect.any(ProjectCreatedEvent),
        expect.any(ProjectFormationStartedEvent),
      ]);
    });
  });
});
