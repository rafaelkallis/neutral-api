import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ProjectDto } from '../dto/ProjectDto';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { Project } from 'project/domain/project/Project';
import {
  UpdateProjectCommand,
  UpdateProjectCommandHandler,
} from './UpdateProject';

describe(UpdateProjectCommand.name, () => {
  let scenario: UnitTestScenario<UpdateProjectCommandHandler>;
  let commandHandler: UpdateProjectCommandHandler;
  let projectRepository: ProjectRepository;
  let authUser: User;
  let project: Project;
  let newTitle: string;
  let command: UpdateProjectCommand;
  let projectDto: ProjectDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(UpdateProjectCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(ProjectRepository)
      .build();
    commandHandler = scenario.subject;
    projectRepository = scenario.module.get(ProjectRepository);
    authUser = td.object(scenario.modelFaker.user());
    project = td.object(scenario.modelFaker.project(authUser.id));
    newTitle = scenario.primitiveFaker.word();
    command = new UpdateProjectCommand(authUser, project.id.value, newTitle);

    td.when(projectRepository.findById(project.id)).thenResolve(project);
    td.when(project.assertCreator(authUser)).thenReturn();

    const objectMapper = scenario.module.get(ObjectMapper);
    projectDto = td.object();
    td.when(
      objectMapper.map(
        td.matchers.isA(Project),
        ProjectDto,
        td.matchers.anything(),
      ),
    ).thenResolve(projectDto);
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    const result = await commandHandler.handle(command);
    expect(result).toBe(projectDto);
    td.verify(project.update(ProjectTitle.from(newTitle), undefined));
    td.verify(projectRepository.persist(project));
  });

  test('should fail if non-owner updates project', async () => {
    td.when(project.assertCreator(authUser)).thenThrow(new Error());
    await expect(commandHandler.handle(command)).rejects.toThrow();
  });
});
