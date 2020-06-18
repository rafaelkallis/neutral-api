import td from 'testdouble';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ProjectDto } from '../dto/ProjectDto';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { Project } from 'project/domain/project/Project';
import { Role } from 'project/domain/role/Role';
import { AssignRoleCommand, AssignRoleCommandHandler } from './AssignRole';
import { UserRepository } from 'user/domain/UserRepository';
import { UserFactory } from 'user/application/UserFactory';
import { Either } from 'shared/domain/Either';
import { PendingState } from 'user/domain/value-objects/states/PendingState';

describe(AssignRoleCommand.name, () => {
  let scenario: UnitTestScenario<AssignRoleCommandHandler>;
  let assignRoleCommandHandler: AssignRoleCommandHandler;
  let assignRoleCommand: AssignRoleCommand;
  let projectRepository: ProjectRepository;
  let creator: User;
  let project: Project;
  let role: Role;
  let assignee: User;
  let projectDto: ProjectDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(AssignRoleCommandHandler)
      .addProviderMock(ObjectMapper)
      .addProviderMock(ProjectRepository)
      .addProviderMock(UserRepository)
      .addProviderMock(UserFactory)
      .build();
    assignRoleCommandHandler = scenario.subject;
    projectRepository = scenario.module.get(ProjectRepository);
    creator = scenario.modelFaker.user();
    project = scenario.modelFaker.project(creator.id);
    role = scenario.modelFaker.role();
    project.roles.add(role);
    assignee = scenario.modelFaker.user();
    assignRoleCommand = new AssignRoleCommand(
      creator,
      project.id,
      role.id,
      Either.left(assignee.id),
    );

    td.when(projectRepository.findById(project.id)).thenResolve(project);
    jest.spyOn(project, 'assertCreator');
    jest.spyOn(project, 'assignUserToRole');

    const objectMapper = scenario.module.get(ObjectMapper);
    projectDto = td.object();
    td.when(
      objectMapper.map(project, ProjectDto, td.matchers.anything()),
    ).thenResolve(projectDto);
  });

  test('assign with id of active user', async () => {
    const result = await assignRoleCommandHandler.handle(assignRoleCommand);
    expect(result).toBe(projectDto);
    expect(project.assertCreator).toHaveBeenCalledWith(creator);
    expect(project.assignUserToRole).toHaveBeenCalledWith(assignee, role.id);
  });

  test.todo('assign with id of pending user');

  test('assign with email of existing active user', async () => {
    assignRoleCommand = new AssignRoleCommand(
      creator,
      project.id,
      role.id,
      Either.right(assignee.email),
    );
    const result = await assignRoleCommandHandler.handle(assignRoleCommand);
    expect(result).toBe(projectDto);
    expect(project.assertCreator).toHaveBeenCalledWith(creator);
    expect(project.assignUserToRole).toHaveBeenCalledWith(assignee, role.id);
  });

  test.todo('assign with email of pending user');

  test('assign with email of non-existing user', async () => {
    const email = scenario.valueObjectFaker.user.email();
    const createdUser = scenario.modelFaker.user();
    createdUser.state = PendingState.getInstance();
    const userFactory = scenario.module.get(UserFactory);
    td.when(userFactory.create({ email })).thenReturn(createdUser);
    const userRepository = scenario.module.get(UserRepository);
    jest.spyOn(userRepository, 'persist');
    assignRoleCommand = new AssignRoleCommand(
      creator,
      project.id,
      role.id,
      Either.right(email),
    );
    const result = await assignRoleCommandHandler.handle(assignRoleCommand);
    expect(result).toBe(projectDto);
    expect(userRepository.persist).toHaveBeenCalledWith(createdUser);
    expect(project.assignUserToRole).toHaveBeenCalledWith(createdUser, role.id);
  });
});
