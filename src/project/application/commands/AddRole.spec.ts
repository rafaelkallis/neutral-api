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
import { Either } from 'shared/domain/Either';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { UserId } from 'user/domain/value-objects/UserId';

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
    jest.spyOn(project, 'addRole');
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
      objectMapper.map(project, ProjectDto, td.matchers.anything()),
    ).thenResolve(projectDto);
  });

  test('should add role', async () => {
    const result = await commandHandler.handle(command);
    expect(result).toBe(projectDto);
    expect(project.addRole).toHaveBeenCalledWith(
      RoleTitle.from(title),
      RoleDescription.from(description),
    );
  });

  test('should check if authenticated user is the project creator', async () => {
    jest.spyOn(project, 'assertCreator');
    await commandHandler.handle(command);
    expect(project.assertCreator).toHaveBeenCalledWith(authUser);
  });

  describe('when assignee is present', () => {
    let assignee: User;
    let userRepository: UserRepository;

    beforeEach(() => {
      assignee = scenario.modelFaker.user();
      jest.spyOn(project, 'assignUserToRole');
      userRepository = scenario.module.get(UserRepository);
      td.when(userRepository.findById(assignee.id)).thenResolve(assignee);
      td.when(userRepository.findByEmail(assignee.email)).thenResolve(assignee);
    });

    describe('when assigneeId', () => {
      test('of existing active user, should assign user', async () => {
        command = new AddRoleCommand(
          authUser,
          project.id.value,
          title,
          description,
          Either.left(assignee.id),
        );
        const result = await commandHandler.handle(command);
        expect(result).toBe(projectDto);
        expect(project.assignUserToRole).toHaveBeenCalledWith(
          assignee,
          expect.any(RoleId),
        );
      });

      test('of non-existing user, should fail', async () => {
        command = new AddRoleCommand(
          authUser,
          project.id.value,
          title,
          description,
          Either.left(UserId.create()),
        );
        await expect(commandHandler.handle(command)).rejects.toThrowError();
      });
    });

    describe('when assigneeEmail', () => {
      test('of existing user, should assign user', async () => {
        command = new AddRoleCommand(
          authUser,
          project.id.value,
          title,
          description,
          Either.right(assignee.email),
        );
        const result = await commandHandler.handle(command);
        expect(result).toBe(projectDto);
        expect(project.assignUserToRole).toHaveBeenCalledWith(
          assignee,
          expect.any(RoleId),
        );
      });

      test('of non-existing user, should create and assign user', async () => {
        const email = scenario.valueObjectFaker.user.email();
        command = new AddRoleCommand(
          authUser,
          project.id.value,
          title,
          description,
          Either.right(email),
        );
        const createdUser = scenario.modelFaker.user();
        createdUser.email = email;
        const userFactory = scenario.module.get(UserFactory);
        td.when(userFactory.create({ email })).thenResolve(createdUser);
        const result = await commandHandler.handle(command);
        expect(result).toBe(projectDto);
        expect(project.assignUserToRole).toHaveBeenCalledWith(
          createdUser,
          expect.any(RoleId),
        );
      });
    });
  });
});
