import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import {
  CreateProjectCommand,
  CreateProjectCommandHandler,
} from 'project/application/commands/CreateProject';
import { ProjectDto } from '../dto/ProjectDto';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';
import { Project } from 'project/domain/Project';

describe(CreateProjectCommand.name, () => {
  let scenario: UnitTestScenario<CreateProjectCommandHandler>;
  let commandHandler: CreateProjectCommandHandler;
  let projectRepository: ProjectRepository;
  let authUser: User;
  let title: string;
  let description: string;
  let command: CreateProjectCommand;
  let projectDto: ProjectDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(CreateProjectCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(ProjectRepository)
      .build();
    commandHandler = scenario.subject;
    projectRepository = scenario.module.get(ProjectRepository);
    authUser = td.object(scenario.modelFaker.user());
    title = scenario.primitiveFaker.word();
    description = scenario.primitiveFaker.paragraph();
    command = new CreateProjectCommand(authUser, title, description);

    const objectMapper = scenario.module.get(ObjectMapper);
    projectDto = td.object();
    td.when(
      objectMapper.map(
        td.matchers.isA(Project),
        ProjectDto,
        td.matchers.anything(),
      ),
    ).thenReturn(projectDto);
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    const result = await commandHandler.handle(command);
    expect(result).toBe(projectDto);
    td.verify(
      projectRepository.persist(
        td.matchers.contains({
          title: ProjectTitle.from(title),
          description: ProjectDescription.from(description),
        }),
      ),
    );
  });
});
