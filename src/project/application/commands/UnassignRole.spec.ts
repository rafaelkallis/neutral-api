import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ProjectDto } from '../dto/ProjectDto';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { Project } from 'project/domain/project/Project';
import {
  UnassignRoleCommand,
  UnassignRoleCommandHandler,
} from 'project/application/commands/UnassignRole';
import { Role } from 'project/domain/role/Role';

describe(UnassignRoleCommand.name, () => {
  let scenario: UnitTestScenario<UnassignRoleCommandHandler>;
  let unassignRoleCommandHandler: UnassignRoleCommandHandler;
  let projectRepository: ProjectRepository;
  let authUser: User;
  let project: Project;
  let role: Role;
  let assignee: User;
  let unassignRoleCommand: UnassignRoleCommand;
  let projectDto: ProjectDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(UnassignRoleCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(ProjectRepository)
      .build();
    unassignRoleCommandHandler = scenario.subject;
    projectRepository = scenario.module.get(ProjectRepository);
    authUser = scenario.modelFaker.user();
    project = scenario.modelFaker.project(authUser.id);
    role = scenario.modelFaker.role();
    project.roles.add(role);
    assignee = scenario.modelFaker.user();
    role.assigneeId = assignee.id;
    unassignRoleCommand = new UnassignRoleCommand(
      authUser,
      project.id.value,
      role.id.value,
    );

    td.when(projectRepository.findById(project.id)).thenResolve(project);
    jest.spyOn(project, 'assertCreator');
    jest.spyOn(project, 'unassignRole');

    const objectMapper = scenario.module.get(ObjectMapper);
    projectDto = td.object();
    td.when(
      objectMapper.map(project, ProjectDto, td.matchers.anything()),
    ).thenReturn(projectDto);
  });

  test('happy path', async () => {
    const actualProjectDto = await unassignRoleCommandHandler.handle(
      unassignRoleCommand,
    );
    expect(actualProjectDto).toBe(projectDto);
    expect(project.assertCreator).toHaveBeenCalledWith(authUser);
    expect(project.unassignRole).toHaveBeenCalledWith(role.id);
  });
});
