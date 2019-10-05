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
} from '../common';
import { entityFaker, primitiveFaker } from '../test';
import { ProjectService } from './project.service';
import { ModelService } from './services/model.service';
import { ProjectDto, ProjectDtoBuilder } from './dto/project.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

describe('project service', () => {
  let projectService: ProjectService;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let modelService: ModelService;
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
        ModelService,
      ],
    }).compile();

    projectService = module.get(ProjectService);
    projectRepository = module.get(ProjectRepository);
    roleRepository = module.get(RoleRepository);
    modelService = module.get(ModelService);

    user = entityFaker.user();
    project = entityFaker.project(user.id);
    projectDto = new ProjectDtoBuilder(project)
      .exposeRelativeContributions()
      .build();
  });

  test('should be defined', () => {
    expect(projectService).toBeDefined();
  });

  describe('get projects', () => {
    let projects: ProjectEntity[];
    let projectDtos: ProjectDto[];

    beforeEach(async () => {
      projects = [
        entityFaker.project(user.id),
        entityFaker.project(user.id),
        entityFaker.project(user.id),
      ];
      projectDtos = projects.map(project =>
        new ProjectDtoBuilder(project).exposeRelativeContributions().build(),
      );
      jest.spyOn(projectRepository, 'find').mockResolvedValue(projects);
    });

    test('happy path', async () => {
      await expect(projectService.getProjects(user)).resolves.toEqual(
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
      jest.spyOn(modelService, 'computeRelativeContributions').mockReturnValue({
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

    test('should compute relative contributions if state is changed to finished', async () => {
      project.state = ProjectState.PEER_REVIEW;
      dto = UpdateProjectDto.from({ state: ProjectState.FINISHED });
      await expect(
        projectService.updateProject(user, project.id, dto),
      ).resolves.not.toThrow();
      expect(modelService.computeRelativeContributions).toHaveBeenCalled();
      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ relativeContributions: expect.anything() }),
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

  describe('get relative contributions', () => {
    let role1: RoleEntity;
    let role2: RoleEntity;
    let role3: RoleEntity;
    let role4: RoleEntity;

    beforeEach(async () => {
      role1 = entityFaker.role(project.id);
      role2 = entityFaker.role(project.id);
      role3 = entityFaker.role(project.id);
      role4 = entityFaker.role(project.id);
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest
        .spyOn(roleRepository, 'find')
        .mockResolvedValue([role1, role2, role3, role4]);
      jest
        .spyOn(modelService, 'peerReviewsMapToVector')
        .mockReturnValue([0.25, 0.25, 0.25, 0.25]);
      jest.spyOn(modelService, 'computeRelativeContributions').mockReturnValue({
        [role1.id]: 0.25,
        [role2.id]: 0.25,
        [role3.id]: 0.25,
        [role4.id]: 0.25,
      });
    });

    test('happy path', async () => {
      await expect(
        projectService.getRelativeContributions(user, project.id),
      ).resolves.toEqual({
        [role1.id]: 0.25,
        [role2.id]: 0.25,
        [role3.id]: 0.25,
        [role4.id]: 0.25,
      });
    });
  });
});
