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
  PeerReviews,
  Contributions,
  ContributionsModelService,
  TeamSpiritModelService,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';
import { ProjectService } from './project.service';
import { ProjectDto, ProjectDtoBuilder } from './dto/project.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { GetProjectsQueryDto } from './dto/get-projects-query.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SubmitPeerReviewsDto } from './dto/submit-peer-reviews.dto';

describe('project service', () => {
  let projectService: ProjectService;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let contributionsModelService: ContributionsModelService;
  let teamSpiritModelService: TeamSpiritModelService;
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
        TeamSpiritModelService,
      ],
    }).compile();

    projectService = module.get(ProjectService);
    projectRepository = module.get(ProjectRepository);
    roleRepository = module.get(RoleRepository);
    contributionsModelService = module.get(ContributionsModelService);
    teamSpiritModelService = module.get(TeamSpiritModelService);

    user = entityFaker.user();
    project = entityFaker.project(user.id);
    projectDto = new ProjectDtoBuilder(project)
      .exposeContributions()
      .exposeTeamSpirit()
      .build();
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
        new ProjectDtoBuilder(project)
          .exposeContributions()
          .exposeTeamSpirit()
          .build(),
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
      project.state = ProjectState.FORMATION;
      role = entityFaker.role(project.id, user.id);
      const title = primitiveFaker.words();
      dto = UpdateProjectDto.from({ title });
      jest.spyOn(roleRepository, 'find').mockResolvedValue([role]);
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(projectRepository, 'save').mockResolvedValue(project);
    });

    test('happy path', async () => {
      await projectService.updateProject(user, project.id, dto);
      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: dto.title }),
      );
    });

    test('should fail if non-owner updates project', async () => {
      project.ownerId = primitiveFaker.id();
      await expect(
        projectService.updateProject(user, project.id, dto),
      ).rejects.toThrow();
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await expect(
        projectService.updateProject(user, project.id, dto),
      ).rejects.toThrow();
    });
  });

  describe('finish formation', () => {
    let role1: RoleEntity;
    let role2: RoleEntity;
    let role3: RoleEntity;

    beforeEach(async () => {
      project.state = ProjectState.FORMATION;
      role1 = entityFaker.role(project.id, user.id);
      role2 = entityFaker.role(project.id, user.id);
      role3 = entityFaker.role(project.id, user.id);
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest
        .spyOn(roleRepository, 'find')
        .mockResolvedValue([role1, role2, role3]);
      jest.spyOn(projectRepository, 'save').mockResolvedValue(project);
    });

    test('happy path', async () => {
      await projectService.finishFormation(user, project.id);
      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ state: ProjectState.PEER_REVIEW }),
      );
    });

    test('should fail if authenticated user is ot project owner', async () => {
      project.ownerId = primitiveFaker.id();
      await expect(
        projectService.finishFormation(user, project.id),
      ).rejects.toThrow();
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await expect(
        projectService.finishFormation(user, project.id),
      ).rejects.toThrow();
    });

    test('should fail if a role has no user assigned', async () => {
      role1.assigneeId = null;
      await expect(
        projectService.finishFormation(user, project.id),
      ).rejects.toThrow();
    });

    test.skip('should fail if same user is assigned to multiple roles', async () => {
      role2.assigneeId = user.id;
      role3.assigneeId = user.id;
      await expect(
        projectService.finishFormation(user, project.id),
      ).rejects.toThrow();
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

  describe('submit peer reviews', () => {
    let user: UserEntity;
    let project: ProjectEntity;
    let role1: RoleEntity;
    let role2: RoleEntity;
    let role3: RoleEntity;
    let role4: RoleEntity;
    let peerReviews: PeerReviews;
    let contributions: Contributions;
    let teamSpirit: number;
    let dto: SubmitPeerReviewsDto;

    beforeEach(async () => {
      user = entityFaker.user();
      project = entityFaker.project(user.id);
      project.state = ProjectState.PEER_REVIEW;
      role1 = entityFaker.role(project.id, user.id);
      role1.peerReviews = null;
      role2 = entityFaker.role(project.id, user.id);
      role2.peerReviews = {};
      role3 = entityFaker.role(project.id, user.id);
      role3.peerReviews = {};
      role4 = entityFaker.role(project.id, user.id);
      role4.peerReviews = {};

      peerReviews = {
        [role1.id]: 0,
        [role2.id]: 0.3,
        [role3.id]: 0.2,
        [role4.id]: 0.5,
      };
      dto = SubmitPeerReviewsDto.from({ peerReviews });
      contributions = {};
      teamSpirit = 0.5;
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role1);
      jest
        .spyOn(roleRepository, 'find')
        .mockResolvedValue([role2, role3, role4]);
      jest.spyOn(roleRepository, 'save').mockResolvedValue(role1);
      jest
        .spyOn(contributionsModelService, 'computeContributions')
        .mockReturnValue(contributions);
      jest
        .spyOn(teamSpiritModelService, 'computeTeamSpirit')
        .mockReturnValue(teamSpirit);
      jest.spyOn(projectRepository, 'save').mockResolvedValue(project);
    });

    test('happy path, final peer review', async () => {
      await expect(
        projectService.submitPeerReviews(user, project.id, dto),
      ).resolves.not.toThrow();
      expect(
        contributionsModelService.computeContributions,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          [role1.id]: peerReviews,
          [role2.id]: role2.peerReviews,
          [role3.id]: role3.peerReviews,
          [role4.id]: role4.peerReviews,
        }),
      );
      expect(teamSpiritModelService.computeTeamSpirit).toHaveBeenCalledWith(
        expect.objectContaining({
          [role1.id]: peerReviews,
          [role2.id]: role2.peerReviews,
          [role3.id]: role3.peerReviews,
          [role4.id]: role4.peerReviews,
        }),
      );
      expect(project.state).toBe(ProjectState.FINISHED);
      expect(roleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ peerReviews }),
      );
      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ contributions, teamSpirit }),
      );
    });

    test('should not compute contributions and team spirit if not final peer review,', async () => {
      role2.peerReviews = null;
      await expect(
        projectService.submitPeerReviews(user, project.id, dto),
      ).resolves.not.toThrow();
      expect(
        contributionsModelService.computeContributions,
      ).not.toHaveBeenCalled();
      expect(teamSpiritModelService.computeTeamSpirit).not.toHaveBeenCalled();
      expect(project.state).toBe(ProjectState.PEER_REVIEW);
      expect(roleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ peerReviews }),
      );
      expect(projectRepository.save).not.toHaveBeenCalled();
    });

    test('should fail if project is not in peer-review state', async () => {
      project.state = ProjectState.FORMATION;
      await expect(
        projectService.submitPeerReviews(user, project.id, dto),
      ).rejects.toThrow();
    });

    test('should fail if peer reviews have been previously submitted', async () => {
      role1.peerReviews = peerReviews;
      await expect(
        projectService.submitPeerReviews(user, project.id, dto),
      ).rejects.toThrow();
    });

    test('should fail if a peer review is for non-existing peer', async () => {
      role1.peerReviews = peerReviews;
      delete role1.peerReviews[role2.id];
      role1.peerReviews[primitiveFaker.id()] = 0.3;
      await expect(
        projectService.submitPeerReviews(user, project.id, dto),
      ).rejects.toThrow();
    });
  });
});
