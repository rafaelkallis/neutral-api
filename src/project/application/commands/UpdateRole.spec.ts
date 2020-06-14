import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ProjectDto } from '../dto/ProjectDto';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { Project } from 'project/domain/project/Project';
import {
  UpdateRoleCommand,
  UpdateRoleCommandHandler,
} from 'project/application/commands/UpdateRole';
import { Role } from 'project/domain/role/Role';

describe(UpdateRoleCommand.name, () => {
  let scenario: UnitTestScenario<UpdateRoleCommandHandler>;
  let commandHandler: UpdateRoleCommandHandler;
  let projectRepository: ProjectRepository;
  let authUser: User;
  let project: Project;
  let role: Role;
  let newTitle: string;
  let command: UpdateRoleCommand;
  let projectDto: ProjectDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(UpdateRoleCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(ProjectRepository)
      .build();
    commandHandler = scenario.subject;
    projectRepository = scenario.module.get(ProjectRepository);
    authUser = scenario.modelFaker.user();
    project = scenario.modelFaker.project(authUser.id);
    role = scenario.modelFaker.role();
    project.roles.add(role);
    newTitle = scenario.primitiveFaker.word();
    command = new UpdateRoleCommand(
      authUser,
      project.id.value,
      role.id.value,
      newTitle,
    );

    td.when(projectRepository.findById(project.id)).thenResolve(project);
    jest.spyOn(project, 'assertCreator');
    jest.spyOn(project, 'updateRole');

    const objectMapper = scenario.module.get(ObjectMapper);
    projectDto = td.object();
    td.when(
      objectMapper.map(project, ProjectDto, td.matchers.anything()),
    ).thenResolve(projectDto);
  });

  test('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  test('happy path', async () => {
    const result = await commandHandler.handle(command);
    expect(result).toBe(projectDto);
    expect(project.assertCreator).toHaveBeenCalledWith(authUser);
    expect(project.updateRole).toHaveBeenCalledWith(
      role.id,
      ProjectTitle.from(newTitle),
      undefined,
    );
  });
});
