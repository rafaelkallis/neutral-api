import { Test } from '@nestjs/testing';

import {
  ConfigService,
  Project,
  ProjectRepository,
  RandomService,
  TokenService,
  User,
  UserRepository,
  Role,
  RoleRepository,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';

import { ProjectController } from './project.controller';

import { ModelService } from './services/model.service';

describe('Project Controller', () => {
  let projectController: ProjectController;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let modelService: ModelService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        UserRepository,
        ProjectRepository,
        RoleRepository,
        TokenService,
        RandomService,
        ConfigService,
        ModelService,
      ],
    }).compile();

    projectController = module.get(ProjectController);
    projectRepository = module.get(ProjectRepository);
    roleRepository = module.get(RoleRepository);
    modelService = module.get(ModelService);
  });

  test('should be defined', () => {
    expect(projectController).toBeDefined();
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
      await expect(projectController.getProjects()).resolves.toEqual(projects);
    });
  });

  describe('get project', () => {
    let project: Project;

    beforeEach(async () => {
      project = entityFaker.project('');
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
    });

    test('happy path', async () => {
      await expect(projectController.getProject(project.id)).resolves.toEqual(
        project,
      );
    });
  });

  describe('create project', () => {
    let user: User;
    let project: Project;

    beforeEach(async () => {
      user = entityFaker.user();
      project = entityFaker.project(user.id);
      jest.spyOn(projectRepository, 'save').mockResolvedValue(project);
    });

    test('happy path', async () => {
      await expect(
        projectController.createProject(user, project),
      ).resolves.toEqual(project);
    });
  });

  describe('patch project', () => {
    let user: User;
    let project: Project;
    let newTitle: string;

    beforeEach(async () => {
      user = entityFaker.user();
      project = entityFaker.project(user.id);
      newTitle = primitiveFaker.words();
      jest.spyOn(projectRepository, 'save').mockResolvedValue(project);
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
    });

    test('happy path', async () => {
      await expect(
        projectController.patchProject(user, project.id, { title: newTitle }),
      ).resolves.toEqual({ ...project, title: newTitle });
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
      await projectController.deleteProject(user, project.id);
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
        projectController.getRelativeContributions(user, project.id),
      ).resolves.toEqual({
        [role1.id]: 0.25,
        [role2.id]: 0.25,
        [role3.id]: 0.25,
        [role4.id]: 0.25,
      });
    });
  });
});
