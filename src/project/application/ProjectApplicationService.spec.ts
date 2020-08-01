import td from 'testdouble';
import { InternalProject, Project } from 'project/domain/project/Project';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import {
  GetProjectsQueryDto,
  GetProjectsType,
} from 'project/application/dto/GetProjectsQueryDto';
import { FormationProjectState } from 'project/domain/project/value-objects/states/FormationProjectState';
import { Role } from 'project/domain/role/Role';
import { User } from 'user/domain/User';
import { RoleCollection } from 'project/domain/role/RoleCollection';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { UserRepository } from 'user/domain/UserRepository';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { UserCollection } from 'user/domain/UserCollection';

describe(ProjectApplicationService.name, () => {
  let scenario: UnitTestScenario<ProjectApplicationService>;
  let projectApplication: ProjectApplicationService;

  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let objectMapper: ObjectMapper;
  let creatorUser: User;
  let project: InternalProject;
  let roles: Role[];
  let reviewTopic: ReviewTopic;
  let expectedProjectDto: ProjectDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(ProjectApplicationService)
      .addProviderMock(ProjectRepository)
      .addProviderMock(UserRepository)
      .addProviderMock(ObjectMapper)
      .build();
    projectApplication = scenario.subject;

    userRepository = scenario.module.get(UserRepository);
    projectRepository = scenario.module.get(ProjectRepository);
    objectMapper = scenario.module.get(ObjectMapper);

    creatorUser = scenario.modelFaker.user();

    project = scenario.modelFaker.project(creatorUser.id);
    td.when(projectRepository.findById(project.id)).thenResolve(project);
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

    expectedProjectDto = td.object();
    td.when(
      objectMapper.map(
        td.matchers.isA(Project),
        ProjectDto,
        td.matchers.anything(),
      ),
    ).thenResolve(expectedProjectDto);
  });

  test('should be defined', () => {
    expect(projectApplication).toBeDefined();
  });

  describe('get created projects', () => {
    let query: GetProjectsQueryDto;
    let projectDtos: ProjectDto[];

    beforeEach(() => {
      query = new GetProjectsQueryDto(GetProjectsType.CREATED);
      const projects = [
        scenario.modelFaker.project(creatorUser.id),
        scenario.modelFaker.project(creatorUser.id),
        scenario.modelFaker.project(creatorUser.id),
      ];
      td.when(projectRepository.findByCreatorId(creatorUser.id)).thenResolve(
        projects,
      );
      projectDtos = td.object();
      td.when(
        objectMapper.mapIterable(projects, ProjectDto, td.matchers.anything()),
      ).thenResolve(projectDtos);
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
    let projects: InternalProject[];
    let assigneeUser: User;
    let query: GetProjectsQueryDto;
    let projectDtos: ProjectDto[];

    beforeEach(() => {
      assigneeUser = scenario.modelFaker.user();
      projects = [];
      for (let i = 0; i < 3; i++) {
        projects[i] = scenario.modelFaker.project(creatorUser.id);
        projects[i].roles = new RoleCollection([
          scenario.modelFaker.role(assigneeUser.id),
        ]);
      }
      query = new GetProjectsQueryDto(GetProjectsType.ASSIGNED);
      projectDtos = td.object();
      td.when(
        objectMapper.mapIterable(
          td.matchers.anything(),
          ProjectDto,
          td.matchers.anything(),
        ),
      ).thenResolve(projectDtos);
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

  describe('finish formation', () => {
    let assignees: User[];

    beforeEach(() => {
      assignees = [];
      for (const role of roles) {
        const assignee = scenario.modelFaker.user();
        role.assigneeId = assignee.id;
        assignees.push(assignee);
      }
      td.when(userRepository.findByIds(td.matchers.anything())).thenResolve(
        assignees,
      );
      project.state = FormationProjectState.INSTANCE;
      jest.spyOn(project, 'finishFormation');
    });

    test('happy path', async () => {
      await projectApplication.finishFormation(creatorUser, project.id.value);
      expect(project.assertCreator).toHaveBeenCalledWith(creatorUser);
      expect(project.finishFormation).toHaveBeenCalledWith(
        new UserCollection(assignees),
      );
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
      project.state = FinishedProjectState.INSTANCE;
      jest.spyOn(project, 'archive');
    });

    test('happy path', async () => {
      await projectApplication.archiveProject(creatorUser, project.id.value);
      expect(project.assertCreator).toHaveBeenCalledWith(creatorUser);
      expect(project.archive).toHaveBeenCalledWith();
    });
  });
});
