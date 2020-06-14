import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { Project } from 'project/domain/project/Project';
import {
  RemoveRoleCommand,
  RemoveRoleCommandHandler,
} from 'project/application/commands/RemoveRole';
import { Role } from 'project/domain/role/Role';

describe(RemoveRoleCommand.name, () => {
  let scenario: UnitTestScenario<RemoveRoleCommandHandler>;
  let removeRoleCommandHandler: RemoveRoleCommandHandler;
  let projectRepository: ProjectRepository;
  let authUser: User;
  let project: Project;
  let role: Role;
  let removeRoleCommand: RemoveRoleCommand;
  let projectDto: ProjectDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(RemoveRoleCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(ProjectRepository)
      .build();
    removeRoleCommandHandler = scenario.subject;
    projectRepository = scenario.module.get(ProjectRepository);
    authUser = scenario.modelFaker.user();
    project = scenario.modelFaker.project(authUser.id);
    role = scenario.modelFaker.role();
    project.roles.add(role);
    removeRoleCommand = new RemoveRoleCommand(
      authUser,
      project.id.value,
      role.id.value,
    );

    td.when(projectRepository.findById(project.id)).thenResolve(project);
    jest.spyOn(project, 'assertCreator');
    jest.spyOn(project, 'removeRole');

    const objectMapper = scenario.module.get(ObjectMapper);
    projectDto = td.object();
    td.when(
      objectMapper.map(project, ProjectDto, td.matchers.anything()),
    ).thenResolve(projectDto);
  });

  test('happy path', async () => {
    const actualProjectDto = await removeRoleCommandHandler.handle(
      removeRoleCommand,
    );
    expect(actualProjectDto).toBe(projectDto);
    expect(project.assertCreator).toHaveBeenCalledWith(authUser);
    expect(project.removeRole).toHaveBeenCalledWith(role.id);
  });
});
