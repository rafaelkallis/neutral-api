import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ProjectDto } from '../dto/ProjectDto';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { Project } from 'project/domain/project/Project';
import {
  AddRoleCommand,
  AddRoleCommandHandler,
} from 'project/application/commands/AddRole';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { UserRepository } from 'user/domain/UserRepository';
import { UserFactory } from 'user/application/UserFactory';

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
      .addProviderMock(UserRepository)
      .addProviderMock(UserFactory)
      .build();
    commandHandler = scenario.subject;
    projectRepository = scenario.module.get(ProjectRepository);
    authUser = scenario.modelFaker.user();
    project = scenario.modelFaker.project(authUser.id);
    title = scenario.primitiveFaker.word();
    description = scenario.primitiveFaker.paragraph();
    command = new AddRoleCommand(
      authUser,
      project.id.value,
      title,
      description,
    );

    td.when(projectRepository.findById(project.id)).thenResolve(project);

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

  test('should add role', async () => {
    const result = await commandHandler.handle(command);
    expect(result).toBe(projectDto);
    td.verify(
      project.addRole(RoleTitle.from(title), RoleDescription.from(description)),
    );
  });

  test('should check if authenticated user is the project creator', async () => {
    jest.spyOn(project, 'assertCreator');
    await commandHandler.handle(command);
    expect(project.assertCreator).toHaveBeenCalledWith(authUser);
  });
});
