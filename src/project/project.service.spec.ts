import { Test } from '@nestjs/testing';

import {
  ConfigService,
  ProjectEntity,
  ProjectState,
  ProjectRepository,
  RandomService,
  TokenService,
  UserEntity,
  UserRepository,
  RoleEntity,
  RoleRepository,
  ContributionsModelService,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';
import { ProjectService } from './project.service';
import { ProjectDto, ProjectDtoBuilder } from './dto/project.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { GetProjectsQueryDto } from './dto/get-projects-query.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

describe('project service', () => {
  let projectService: ProjectService;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let contributionsModelService: ContributionsModelService;
  let user: UserEntity;
  let project: ProjectEntity;
  let projectDto: ProjectDto;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProjectService,
        UserRepository,
        ProjectRepository,
        RoleRepository,
        TokenService,
        RandomService,
        ConfigService,
        ContributionsModelService,
      ],
    }).compile();

    projectService = module.get(ProjectService);
    projectRepository = module.get(ProjectRepository);
    roleRepository = module.get(RoleRepository);
    contributionsModelService = module.get(ContributionsModelService);

    user = entityFaker.user();
    project = entityFaker.project(user.id);
    projectDto = new ProjectDtoBuilder(project).exposeContributions().build();
  });

  test('should be defined', () => {
    expect(projectService).toBeDefined();
  });

  describe('get projects', () => {
    let projects: ProjectEntity[];
    let projectDtos: ProjectDto[];
    let query: GetProjectsQueryDto;

    beforeEach(async () => {
      projects = [
        entityFaker.project(user.id),
        entityFaker.project(user.id),
        entityFaker.project(user.id),
      ];
      projectDtos = projects.map(project =>
        new ProjectDtoBuilder(project).exposeContributions().build(),
      );
      query = GetProjectsQueryDto.from({});
      jest.spyOn(projectRepository, 'findPage').mockResolvedValue(projects);
    });

    test('happy path', async () => {
      await expect(projectService.getProjects(user, query)).resolves.toEqual(
        projectDtos,
      );
    });
  });

  describe('get project', () => {
    beforeEach(async () => {
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
    });

    test('happy path', async () => {
      await expect(
        projectService.getProject(user, project.id),
      ).resolves.toEqual(projectDto);
    });
  });

  describe('create project', () => {
    let dto: CreateProjectDto;

    beforeEach(async () => {
      dto = CreateProjectDto.from(project);
      jest.spyOn(projectRepository, 'save').mockResolvedValue(project);
    });

    test('happy path', async () => {
      await projectService.createProject(user, dto);
      expect(projectRepository.save).toHaveBeenCalled();
    });
  });

  describe('update project', () => {
    let role: RoleEntity;
    let dto: UpdateProjectDto;

    beforeEach(async () => {
      role = entityFaker.role(project.id, user.id);
      const title = primitiveFaker.words();
      dto = UpdateProjectDto.from({ title });
      jest.spyOn(roleRepository, 'find').mockResolvedValue([role]);
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(projectRepository, 'save').mockResolvedValue(project);
      jest
        .spyOn(contributionsModelService, 'computeContributions')
        .mockReturnValue({
          [role.id]: 0.25,
          [primitiveFaker.id()]: 0.25,
          [primitiveFaker.id()]: 0.25,
          [primitiveFaker.id()]: 0.25,
        });
    });

    test('happy path', async () => {
      await projectService.updateProject(user, project.id, dto);
      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: dto.title }),
      );
    });

    test('state change should trigger transition validation', async () => {
      project.state = ProjectState.FORMATION;
      dto = UpdateProjectDto.from({ state: ProjectState.FINISHED });
      await expect(
        projectService.updateProject(user, project.id, dto),
      ).rejects.toThrow();
    });

    test('should fail if state change to peer-review state with unassigned role', async () => {
      project.state = ProjectState.FORMATION;
      role.assigneeId = null;
      dto = UpdateProjectDto.from({ state: ProjectState.PEER_REVIEW });
      await expect(
        projectService.updateProject(user, project.id, dto),
      ).rejects.toThrow();
    });

    test('should fail if state change to finish state with pending peer-review', async () => {
      project.state = ProjectState.PEER_REVIEW;
      role.peerReviews = null;
      dto = UpdateProjectDto.from({ state: ProjectState.FINISHED });
      await expect(
        projectService.updateProject(user, project.id, dto),
      ).rejects.toThrow();
    });

    test('should compute contributions if state is changed to finished', async () => {
      project.state = ProjectState.PEER_REVIEW;
      dto = UpdateProjectDto.from({ state: ProjectState.FINISHED });
      await expect(
        projectService.updateProject(user, project.id, dto),
      ).resolves.not.toThrow();
      expect(contributionsModelService.computeContributions).toHaveBeenCalled();
      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ contributions: expect.anything() }),
      );
    });
  });

  describe('delete project', () => {
    beforeEach(async () => {
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(projectRepository, 'remove').mockResolvedValue(project);
    });

    test('happy path', async () => {
      await projectService.deleteProject(user, project.id);
      expect(projectRepository.remove).toHaveBeenCalled();
    });
  });
});
