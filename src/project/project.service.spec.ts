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
  ConsensualityModelService,
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
  let consensualityModelService: ConsensualityModelService;
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
        ConsensualityModelService,
      ],
    }).compile();

    projectService = module.get(ProjectService);
    projectRepository = module.get(ProjectRepository);
    roleRepository = module.get(RoleRepository);
    contributionsModelService = module.get(ContributionsModelService);
    consensualityModelService = module.get(ConsensualityModelService);

    user = entityFaker.user();
    project = entityFaker.project(user.id);
    projectDto = new ProjectDtoBuilder(project, user).build();
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
        new ProjectDtoBuilder(project, user).build(),
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
    let peerReviews: Record<string, Record<string, number>>;
    let contributions: Record<string, number>;
    let consensuality: number;
    let dto: SubmitPeerReviewsDto;

    beforeEach(async () => {
      user = entityFaker.user();
      project = entityFaker.project(user.id);
      project.state = ProjectState.PEER_REVIEW;
      role1 = entityFaker.role(project.id, user.id);
      role2 = entityFaker.role(project.id, user.id);
      role3 = entityFaker.role(project.id, user.id);
      role4 = entityFaker.role(project.id, user.id);

      peerReviews = {};
      for (const role of [role1, role2, role3, role4]) {
        peerReviews[role.id] = {};
        for (const otherRole of [role1, role2, role3, role4]) {
          const score = 1 / 3;
          if (role !== otherRole) {
            peerReviews[role.id][otherRole.id] = score;
            if (role !== role1) {
              const peerReview = entityFaker.peerReview(role, otherRole.id);
              peerReview.score = score;
              role.peerReviews.push(peerReview);
            }
          }
        }
      }

      dto = SubmitPeerReviewsDto.from({ peerReviews: peerReviews[role1.id] });
      contributions = {};
      consensuality = 0.5;
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
        .spyOn(consensualityModelService, 'computeConsensuality')
        .mockReturnValue(consensuality);
      jest.spyOn(projectRepository, 'save').mockResolvedValue(project);
    });

    test('happy path, final peer review', async () => {
      await expect(
        projectService.submitPeerReviews(user, project.id, dto),
      ).resolves.not.toThrow();
      expect(
        contributionsModelService.computeContributions,
      ).toHaveBeenCalledWith(expect.objectContaining(peerReviews));
      expect(
        consensualityModelService.computeConsensuality,
      ).toHaveBeenCalledWith(expect.objectContaining(peerReviews));
      expect(project.state).toBe(ProjectState.MANAGER_REVIEW);
      expect(role1.peerReviews).toHaveLength(3);
      for (const peerReview of role1.peerReviews) {
        expect(peerReview.score).toBe(
          peerReviews[role1.id][peerReview.revieweeRoleId],
        );
      }
      expect(roleRepository.save).toHaveBeenCalled();
      for (const role of [role1, role2, role3, role4]) {
        expect(role.contribution).toEqual(contributions[role.id]);
      }
      expect(project.consensuality).toEqual(consensuality);
      expect(projectRepository.save).toHaveBeenCalled();
    });

    test('should not compute contributions and team spirit if not final peer review,', async () => {
      role2.peerReviews = [];
      await expect(
        projectService.submitPeerReviews(user, project.id, dto),
      ).resolves.not.toThrow();
      expect(roleRepository.save).toHaveBeenCalled();
      expect(
        contributionsModelService.computeContributions,
      ).not.toHaveBeenCalled();
      expect(
        consensualityModelService.computeConsensuality,
      ).not.toHaveBeenCalled();
      expect(project.state).toBe(ProjectState.PEER_REVIEW);
      expect(projectRepository.save).not.toHaveBeenCalled();
    });

    test('should fail if project is not in peer-review state', async () => {
      project.state = ProjectState.FORMATION;
      await expect(
        projectService.submitPeerReviews(user, project.id, dto),
      ).rejects.toThrow();
    });

    test('should fail if peer reviews have been previously submitted', async () => {
      for (const otherRole of [role2, role3, role4]) {
        const peerReview = entityFaker.peerReview(role1, otherRole.id);
        peerReview.score = 1 / 3;
        role1.peerReviews.push(peerReview);
      }
      await expect(
        projectService.submitPeerReviews(user, project.id, dto),
      ).rejects.toThrow();
    });

    test('should fail if a peer review is for non-existing peer', async () => {
      delete dto.peerReviews[role2.id];
      dto.peerReviews[primitiveFaker.id()] = 1 / 3;
      await expect(
        projectService.submitPeerReviews(user, project.id, dto),
      ).rejects.toThrow();
    });
  });

  describe('submit manager review', () => {
    let user: UserEntity;
    let project: ProjectEntity;

    beforeEach(async () => {
      user = entityFaker.user();
      project = entityFaker.project(user.id);
      project.state = ProjectState.MANAGER_REVIEW;

      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(projectRepository, 'save').mockResolvedValue(project);
    });

    test('happy path', async () => {
      await expect(
        projectService.submitManagerReview(user, project.id),
      ).resolves.not.toThrow();
      expect(project.state).toBe(ProjectState.FINISHED);
      expect(projectRepository.save).toHaveBeenCalledWith(project);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = entityFaker.user();
      await expect(
        projectService.submitManagerReview(otherUser, project.id),
      ).rejects.toThrow();
    });

    test('should fail if project is not in manager-review state', async () => {
      const otherUser = entityFaker.user();
      await expect(
        projectService.submitManagerReview(otherUser, project.id),
      ).rejects.toThrow();
    });
  });
});
