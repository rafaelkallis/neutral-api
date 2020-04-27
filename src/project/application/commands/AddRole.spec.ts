import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ProjectDto } from '../dto/ProjectDto';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { Project } from 'project/domain/Project';
import {
  AddRoleCommand,
  AddRoleCommandHandler,
} from 'project/application/commands/AddRole';
import { RoleTitle } from 'project/domain/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/value-objects/RoleDescription';

describe(AddRoleCommand.name, () => {
  let scenario: UnitTestScenario<AddRoleCommandHandler>;
  let commandHandler: AddRoleCommandHandler;
  let projectRepository: ProjectRepository;
  let authUser: User;
  let project: Project;
  let title: string;
  let description: string;
  let command: AddRoleCommand;
  let projectDto: ProjectDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(AddRoleCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(ProjectRepository)
      .build();
    commandHandler = scenario.subject;
    projectRepository = scenario.module.get(ProjectRepository);
    authUser = td.object(scenario.modelFaker.user());
    project = td.object(scenario.modelFaker.project(authUser.id));
    title = scenario.primitiveFaker.word();
    description = scenario.primitiveFaker.paragraph();
    command = new AddRoleCommand(
      authUser,
      project.id.value,
      title,
      description,
    );

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
    ).thenReturn(projectDto);
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    const result = await commandHandler.handle(command);
    expect(result).toBe(projectDto);
    td.verify(
      project.addRole(RoleTitle.from(title), RoleDescription.from(description)),
    );
  });

  test('when authenticated user is not creator, should fail', async () => {
    td.when(project.assertCreator(authUser)).thenThrow(new Error());
    await expect(commandHandler.handle(command)).rejects.toThrow();
  });
});
