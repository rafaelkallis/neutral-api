import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import {
  User,
  Project,
  UserRepository,
  ProjectRepository,
  RandomService,
  TokenService,
  ConfigService,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';

describe('Project Controller', () => {
  let projectController: ProjectController;
  let projectRepository: ProjectRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        UserRepository,
        ProjectRepository,
        TokenService,
        RandomService,
        ConfigService,
      ],
    }).compile();

    projectController = module.get(ProjectController);
    projectRepository = module.get(ProjectRepository);
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
      jest
        .spyOn(projectRepository, 'findOneOrFailWith')
        .mockResolvedValue(project);
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
      jest
        .spyOn(projectRepository, 'findOneOrFailWith')
        .mockResolvedValue(project);
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
      jest
        .spyOn(projectRepository, 'findOneOrFailWith')
        .mockResolvedValue(project);
      jest.spyOn(projectRepository, 'delete').mockResolvedValue(undefined);
    });

    test('happy path', async () => {
      await projectController.deleteProject(user, project.id);
      expect(projectRepository.delete).toHaveBeenCalled();
    });
  });
});
