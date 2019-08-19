import { Test } from '@nestjs/testing';

import {
  ConfigService,
  Project,
  ProjectState,
  ProjectRepository,
  RandomService,
  TokenService,
  User,
  UserRepository,
  Role,
  RoleRepository,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';
import { ProjectService } from './project.service';
import { ModelService } from './services/model.service';
import { ProjectStateTransitionValidationService } from './services/project-state-transition-validation.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

describe('project service', () => {
  let projectService: ProjectService;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let modelService: ModelService;
  let projectStateTransitionValidationService: ProjectStateTransitionValidationService;

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
        ProjectStateTransitionValidationService,
      ],
    }).compile();

    projectService = module.get(ProjectService);
    projectRepository = module.get(ProjectRepository);
    roleRepository = module.get(RoleRepository);
    modelService = module.get(ModelService);
    projectStateTransitionValidationService = module.get(
      ProjectStateTransitionValidationService,
    );
  });

  test('should be defined', () => {
    expect(projectService).toBeDefined();
  });

  describe('get projects', () => {
    let projects: Project[];

    beforeEach(async () => {
      projects = [
        entityFaker.project(''),
        entityFaker.project(''),
        entityFaker.project(''),
      ];
      jest.spyOn(projectRepository, 'find').mockResolvedValue(projects);
    });

    test('happy path', async () => {
      await expect(projectService.getProjects()).resolves.toEqual(projects);
    });
  });

  describe('get project', () => {
    let project: Project;

    beforeEach(async () => {
      project = entityFaker.project('');
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
    });

    test('happy path', async () => {
      await expect(projectService.getProject(project.id)).resolves.toEqual(
        project,
      );
    });
  });

  describe('create project', () => {
    let user: User;
    let dto: CreateProjectDto;

    beforeEach(async () => {
      user = entityFaker.user();
      const project = entityFaker.project(user.id);
      dto = CreateProjectDto.from(project);
      jest.spyOn(projectRepository, 'save').mockResolvedValue(project);
    });

    test('happy path', async () => {
      await projectService.createProject(user, dto);
      expect(projectRepository.save).toHaveBeenCalled();
    });
  });

  describe('update project', () => {
    let user: User;
    let project: Project;
    let dto: UpdateProjectDto;

    beforeEach(async () => {
      user = entityFaker.user();
      project = entityFaker.project(user.id);
      const title = primitiveFaker.words();
      dto = UpdateProjectDto.from({ title });
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(projectRepository, 'save').mockResolvedValue(project);
      jest
        .spyOn(projectStateTransitionValidationService, 'validateTransition')
        .mockImplementation(() => {});
    });

    test('happy path', async () => {
      await projectService.updateProject(user, project.id, dto);
      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: dto.title }),
      );
    });

    test('state change should trigger transition validation', async () => {
      const oldState = project.state;
      const newState = ProjectState.PEER_REVIEW;
      dto = UpdateProjectDto.from({ state: newState });
      await projectService.updateProject(user, project.id, dto);
      expect(
        projectStateTransitionValidationService.validateTransition,
      ).toHaveBeenCalledWith(oldState, newState);
    });
  });

  describe('delete project', () => {
    let user: User;
    let project: Project;

    beforeEach(async () => {
      user = entityFaker.user();
      project = entityFaker.project(user.id);
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(projectRepository, 'remove').mockResolvedValue(project);
    });

    test('happy path', async () => {
      await projectService.deleteProject(user, project.id);
      expect(projectRepository.remove).toHaveBeenCalled();
    });
  });

  describe('get relative contributions', () => {
    let user: User;
    let project: Project;
    let role1: Role;
    let role2: Role;
    let role3: Role;
    let role4: Role;

    beforeEach(async () => {
      user = entityFaker.user();
      project = entityFaker.project(user.id);
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
