import td from 'testdouble';
import { Project, ReadonlyProject } from 'project/domain/project/Project';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import {
  GetProjectsQueryDto,
  GetProjectsType,
} from 'project/application/dto/GetProjectsQueryDto';
import { ProjectFormation } from 'project/domain/project/value-objects/states/ProjectFormation';
import { Role, ReadonlyRole } from 'project/domain/role/Role';
import { User } from 'user/domain/User';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { RoleCollection } from 'project/domain/role/RoleCollection';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { UserRepository } from 'user/domain/UserRepository';
import { MemoryUserRepository } from 'user/infrastructure/MemoryUserRepository';
import { MemoryProjectRepository } from 'project/infrastructure/MemoryProjectRepository';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { ProjectFinished } from 'project/domain/project/value-objects/states/ProjectFinished';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { UserFactory } from 'user/application/UserFactory';
import { Email } from 'user/domain/value-objects/Email';
import { InitialState } from 'user/domain/value-objects/states/InitialState';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';

describe(ProjectApplicationService.name, () => {
  let scenario: UnitTestScenario<ProjectApplicationService>;
  let projectApplication: ProjectApplicationService;

  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let objectMapper: ObjectMapper;
  let creatorUser: User;
  let project: Project;
  let roles: Role[];
  let reviewTopic: ReviewTopic;
  let expectedProjectDto: unknown;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(ProjectApplicationService)
      .addProviderValue(ProjectRepository, new MemoryProjectRepository())
      .addProviderValue(UserRepository, new MemoryUserRepository())
      .addProviderMock(UserFactory)
      .addProviderMock(ObjectMapper)
      .addProviderMock(DomainEventBroker)
      .addProviderMock(ContributionsComputer)
      .addProviderMock(ConsensualityComputer)
      .build();
    projectApplication = scenario.subject;

    userRepository = scenario.module.get(UserRepository);
    projectRepository = scenario.module.get(ProjectRepository);
    objectMapper = scenario.module.get(ObjectMapper);

    creatorUser = scenario.modelFaker.user();
    await userRepository.persist(creatorUser);

    project = scenario.modelFaker.project(creatorUser.id);
    jest.spyOn(project, 'assertCreator');
    roles = [
      scenario.modelFaker.role(),
      scenario.modelFaker.role(),
      scenario.modelFaker.role(),
      scenario.modelFaker.role(),
    ];
    project.roles.addAll(roles);

    reviewTopic = scenario.modelFaker.reviewTopic();
    project.reviewTopics.add(reviewTopic);

    await projectRepository.persist(project);

    expectedProjectDto = td.object();
    td.when(
      objectMapper.map(
        td.matchers.isA(Project),
        ProjectDto,
        td.matchers.anything(),
      ),
    ).thenReturn(expectedProjectDto);
  });

  test('should be defined', () => {
    expect(projectApplication).toBeDefined();
  });

  describe('get created projects', () => {
    let query: GetProjectsQueryDto;
    let projects: ReadonlyProject[];
    let projectDtos: ProjectDto[];

    beforeEach(async () => {
      query = new GetProjectsQueryDto(GetProjectsType.CREATED);
      projects = [
        scenario.modelFaker.project(creatorUser.id),
        scenario.modelFaker.project(creatorUser.id),
        scenario.modelFaker.project(creatorUser.id),
      ];
      await projectRepository.persist(...projects);
      // td.when(projectRepository.findByCreatorId(ownerUser.id)).thenResolve(projects);
      projectDtos = td.object();
      td.when(
        objectMapper.mapArray(
          td.matchers.anything(),
          ProjectDto,
          td.matchers.anything(),
        ),
      ).thenReturn(projectDtos);
    });

    test('happy path', async () => {
      const actualProjectDtos = await projectApplication.getProjects(
        creatorUser,
        query,
      );
      expect(actualProjectDtos).toBe(projectDtos);
    });
  });

  describe('get assigned projects', () => {
    let projects: Project[];
    let assigneeUser: User;
    let query: GetProjectsQueryDto;
    let projectDtos: ProjectDto[];

    beforeEach(async () => {
      assigneeUser = scenario.modelFaker.user();
      await userRepository.persist(assigneeUser);
      projects = [];
      for (let i = 0; i < 3; i++) {
        projects[i] = scenario.modelFaker.project(creatorUser.id);
        projects[i].roles = new RoleCollection([
          scenario.modelFaker.role(assigneeUser.id),
        ]);
      }
      await projectRepository.persist(...projects);
      query = new GetProjectsQueryDto(GetProjectsType.ASSIGNED);
      projectDtos = td.object();
      td.when(
        objectMapper.mapArray(
          td.matchers.anything(),
          ProjectDto,
          td.matchers.anything(),
        ),
      ).thenReturn(projectDtos);
    });

    test('happy path', async () => {
      const actualProjectDtos = await projectApplication.getProjects(
        assigneeUser,
        query,
      );
      expect(actualProjectDtos).toBe(projectDtos);
    });
  });

  describe('get project', () => {
    test('happy path', async () => {
      const actualProjectDto = await projectApplication.getProject(
        creatorUser,
        project.id.value,
      );
      expect(actualProjectDto).toBe(expectedProjectDto);
    });
  });

  describe('assign user to role', () => {
    let assignee: User;
    let roleToBeAssigned: ReadonlyRole;

    beforeEach(async () => {
      assignee = scenario.modelFaker.user();
      await userRepository.persist(assignee);
      roleToBeAssigned = roles[0];
      jest.spyOn(project, 'assignUserToRole');
    });

    test('happy path', async () => {
      await projectApplication.assignUserToRole(
        creatorUser,
        project.id.value,
        roleToBeAssigned.id.value,
        assignee.id.value,
      );
      expect(project.assertCreator).toHaveBeenCalledWith(creatorUser);
      expect(roleToBeAssigned.assigneeId?.equals(assignee.id)).toBeTruthy();
    });

    test('happy path, email of user that exists', async () => {
      await projectApplication.assignUserToRole(
        creatorUser,
        project.id.value,
        roleToBeAssigned.id.value,
        undefined,
        assignee.email.value,
      );
      expect(roleToBeAssigned.assigneeId?.equals(assignee.id)).toBeTruthy();
    });

    test("happy path, email of user that doesn't exist", async () => {
      const assigneeEmail = scenario.primitiveFaker.email();
      const createdUser = scenario.modelFaker.user();
      createdUser.state = InitialState.getInstance();
      jest.spyOn(createdUser, 'invite');
      const userFactory = scenario.module.get(UserFactory);
      td.when(
        userFactory.create({ email: Email.from(assigneeEmail) }),
      ).thenReturn(createdUser);
      jest.spyOn(userRepository, 'persist');

      await projectApplication.assignUserToRole(
        creatorUser,
        project.id.value,
        roleToBeAssigned.id.value,
        undefined,
        assigneeEmail,
      );

      expect(createdUser.invite).toHaveBeenCalledWith();
      expect(userRepository.persist).toHaveBeenCalledWith(createdUser);
      expect(project.assignUserToRole).toHaveBeenCalledWith(
        createdUser,
        roleToBeAssigned.id,
      );
      // TODO check if events emitted
    });
  });

  describe('finish formation', () => {
    let assignees: User[];

    beforeEach(async () => {
      assignees = [];
      for (const role of roles) {
        const assignee = scenario.modelFaker.user();
        role.assigneeId = assignee.id;
        assignees.push(assignee);
        await userRepository.persist(assignee);
      }
      project.state = ProjectFormation.INSTANCE;
      jest.spyOn(project, 'finishFormation');
    });

    test('happy path', async () => {
      await projectApplication.finishFormation(creatorUser, project.id.value);
      expect(project.assertCreator).toHaveBeenCalledWith(creatorUser);
      expect(project.finishFormation).toHaveBeenCalledWith();
    });
  });

  describe('cancel project', () => {
    beforeEach(() => {
      jest.spyOn(project, 'cancel');
    });

    test('happy path', async () => {
      await projectApplication.cancelProject(creatorUser, project.id.value);
      expect(project.assertCreator).toHaveBeenCalledWith(creatorUser);
      expect(project.cancel).toHaveBeenCalledWith();
    });
  });

  describe('archive project', () => {
    beforeEach(() => {
      project.state = ProjectFinished.INSTANCE;
      jest.spyOn(project, 'archive');
    });

    test('happy path', async () => {
      await projectApplication.archiveProject(creatorUser, project.id.value);
      expect(project.assertCreator).toHaveBeenCalledWith(creatorUser);
      expect(project.archive).toHaveBeenCalledWith();
    });
  });
});
