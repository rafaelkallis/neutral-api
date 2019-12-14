import { Test } from '@nestjs/testing';

import { ConfigService, RandomService, TokenService } from '../../common';
import { ContributionsModelService } from './contributions-model.service';
import { ConsensualityModelService } from './consensuality-model.service';
import { UserEntity, UserRepository } from 'user';
import {
  ProjectEntity,
  ProjectState,
  SkipManagerReview,
} from 'project/entities/project.entity';
import { ProjectRepository } from 'project/repositories/project.repository';
import {
  RoleEntity,
  RoleRepository,
  PeerReviewEntity,
  PeerReviewRepository,
} from 'role';
import { entityFaker, primitiveFaker } from 'test';
import { ProjectService } from 'project/services/project.service';
import { ProjectDto, ProjectDtoBuilder } from 'project/dto/project.dto';
import { CreateProjectDto } from 'project/dto/create-project.dto';
import { GetProjectsQueryDto } from 'project/dto/get-projects-query.dto';
import { UpdateProjectDto } from 'project/dto/update-project.dto';
import { SubmitPeerReviewsDto } from 'project/dto/submit-peer-reviews.dto';

describe('project service', () => {
  let projectService: ProjectService;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let peerReviewRepository: PeerReviewRepository;
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
        PeerReviewRepository,
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
    peerReviewRepository = module.get(PeerReviewRepository);
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
      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);
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
      jest.spyOn(projectRepository, 'insert').mockResolvedValue();
    });

    test('happy path', async () => {
      await projectService.createProject(user, dto);
      expect(projectRepository.insert).toHaveBeenCalled();
    });
  });

  describe('update project', () => {
    let dto: UpdateProjectDto;

    beforeEach(async () => {
      project.state = ProjectState.FORMATION;
      const title = primitiveFaker.words();
      dto = UpdateProjectDto.from({ title });
      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);
      jest.spyOn(projectRepository, 'update').mockResolvedValue();
    });

    test('happy path', async () => {
      await projectService.updateProject(user, project.id, dto);
      expect(projectRepository.update).toHaveBeenCalledWith(
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
      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);
      jest.spyOn(project, 'getRoles').mockResolvedValue([role1, role2, role3]);
      jest.spyOn(projectRepository, 'update').mockResolvedValue();
    });

    test('happy path', async () => {
      await projectService.finishFormation(user, project.id);
      expect(projectRepository.update).toHaveBeenCalledWith(
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
      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);
      jest.spyOn(projectRepository, 'delete').mockResolvedValue();
    });

    test('happy path', async () => {
      await projectService.deleteProject(user, project.id);
      expect(projectRepository.delete).toHaveBeenCalled();
    });
  });

  describe('submit peer reviews', () => {
    let user: UserEntity;
    let project: ProjectEntity;
    let roles: RoleEntity[];
    let sentPeerReviews: Record<string, PeerReviewEntity[]>;
    let receivedPeerReviews: Record<string, PeerReviewEntity[]>;
    let contributions: Record<string, number>;
    let consensuality: number;
    let dto: SubmitPeerReviewsDto;

    beforeEach(async () => {
      user = entityFaker.user();
      project = entityFaker.project(user.id);
      project.state = ProjectState.PEER_REVIEW;
      roles = [
        entityFaker.role(project.id, user.id),
        entityFaker.role(project.id),
        entityFaker.role(project.id),
        entityFaker.role(project.id),
      ];

      sentPeerReviews = {};
      receivedPeerReviews = {};
      for (const role of roles) {
        sentPeerReviews[role.id] = [];
        receivedPeerReviews[role.id] = [];
      }
      for (const senderRole of roles) {
        for (const receiverRole of roles) {
          if (senderRole === receiverRole) {
            continue;
          }
          if (senderRole === roles[0]) {
            continue;
          }
          const peerReview = entityFaker.peerReview(
            senderRole.id,
            receiverRole.id,
          );
          sentPeerReviews[senderRole.id].push(peerReview);
          receivedPeerReviews[receiverRole.id].push(peerReview);
        }
        jest
          .spyOn(peerReviewRepository, 'findBySenderRoleId')
          .mockImplementation(
            async senderRoleId => sentPeerReviews[senderRoleId],
          );
        jest
          .spyOn(peerReviewRepository, 'findByReceiverRoleId')
          .mockImplementation(
            async receiverRoleId => receivedPeerReviews[receiverRoleId],
          );
      }

      dto = SubmitPeerReviewsDto.from({
        peerReviews: {
          [roles[1].id]: 1 / 3,
          [roles[2].id]: 1 / 3,
          [roles[3].id]: 1 / 3,
        },
      });
      contributions = {};
      consensuality = 0.5;
      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);
      jest.spyOn(project, 'getRoles').mockResolvedValue(roles);
      jest
        .spyOn(peerReviewRepository, 'findBySenderRoleId')
        .mockResolvedValue([]);
      jest
        .spyOn(peerReviewRepository, 'existsBySenderRoleId')
        .mockResolvedValue(true);
      jest.spyOn(roleRepository, 'update').mockResolvedValue();
      jest.spyOn(peerReviewRepository, 'insert').mockResolvedValue();
      jest
        .spyOn(contributionsModelService, 'computeContributions')
        .mockReturnValue(contributions);
      jest
        .spyOn(consensualityModelService, 'computeConsensuality')
        .mockReturnValue(consensuality);
      jest.spyOn(projectRepository, 'update').mockResolvedValue();
    });

    describe('happy path', () => {
      test('final peer review', async () => {
        await projectService.submitPeerReviews(user, project.id, dto);
        expect(peerReviewRepository.insert).toHaveBeenCalledWith([
          expect.objectContaining({
            senderRoleId: roles[0].id,
            receiverRoleId: roles[1].id,
            score: 1 / 3,
          }),
          expect.objectContaining({
            senderRoleId: roles[0].id,
            receiverRoleId: roles[2].id,
            score: 1 / 3,
          }),
          expect.objectContaining({
            senderRoleId: roles[0].id,
            receiverRoleId: roles[3].id,
            score: 1 / 3,
          }),
        ]);
        expect(
          contributionsModelService.computeContributions,
        ).toHaveBeenCalled();
        expect(
          consensualityModelService.computeConsensuality,
        ).toHaveBeenCalled();
        expect(project.state).toBe(ProjectState.MANAGER_REVIEW);
        expect(roleRepository.update).toHaveBeenCalled();
        for (const role of roles) {
          expect(role.contribution).toEqual(contributions[role.id]);
        }
        expect(project.consensuality).toEqual(consensuality);
        expect(projectRepository.update).toHaveBeenCalled();
      });

      test('final peer review, should skip manager review if "skipManagerReview" is "yes"', async () => {
        project.skipManagerReview = SkipManagerReview.YES;
        await projectService.submitPeerReviews(user, project.id, dto);
        expect(project.state).toBe(ProjectState.FINISHED);
      });

      test('final peer review, should skip manager review if "skipManagerReview" is "if-consensual" and reviews are consensual', async () => {
        project.skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
        jest
          .spyOn(consensualityModelService, 'isConsensual')
          .mockReturnValue(true);
        await projectService.submitPeerReviews(user, project.id, dto);
        expect(project.state).toBe(ProjectState.FINISHED);
      });

      test('final peer review, should not skip manager review if "skipManagerReview" is "if-consensual" and reviews are not consensual', async () => {
        project.skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
        jest
          .spyOn(consensualityModelService, 'isConsensual')
          .mockReturnValue(false);
        await projectService.submitPeerReviews(user, project.id, dto);
        expect(project.state).toBe(ProjectState.MANAGER_REVIEW);
      });

      test('final peer review, should not skip manager review if "skipManagerReview" is "no"', async () => {
        project.skipManagerReview = SkipManagerReview.NO;
        await projectService.submitPeerReviews(user, project.id, dto);
        expect(project.state).toBe(ProjectState.MANAGER_REVIEW);
      });

      test('not final peer review, should not compute contributions and consensuality', async () => {
        jest
          .spyOn(peerReviewRepository, 'existsBySenderRoleId')
          .mockResolvedValue(false);
        await projectService.submitPeerReviews(user, project.id, dto),
          expect(roleRepository.update).not.toHaveBeenCalled();
        expect(
          contributionsModelService.computeContributions,
        ).not.toHaveBeenCalled();
        expect(
          consensualityModelService.computeConsensuality,
        ).not.toHaveBeenCalled();
        expect(project.state).toBe(ProjectState.PEER_REVIEW);
        expect(projectRepository.update).not.toHaveBeenCalled();
      });
    });

    test('should fail if project is not in peer-review state', async () => {
      project.state = ProjectState.FORMATION;
      await expect(
        projectService.submitPeerReviews(user, project.id, dto),
      ).rejects.toThrow();
    });

    test('should fail if peer reviews have been previously submitted', async () => {
      const [role, ...otherRoles] = roles;
      const sentPeerReviews = [];
      for (const otherRole of otherRoles) {
        const peerReview = entityFaker.peerReview(role.id, otherRole.id);
        peerReview.score = 1 / 3;
        sentPeerReviews.push(peerReview);
      }
      jest
        .spyOn(peerReviewRepository, 'findBySenderRoleId')
        .mockResolvedValue(sentPeerReviews);
      await expect(
        projectService.submitPeerReviews(user, project.id, dto),
      ).rejects.toThrow();
    });

    test('should fail if a peer review is for non-existing peer', async () => {
      delete dto.peerReviews[roles[1].id];
      dto.peerReviews[primitiveFaker.id()] = 1 / 3;
      await expect(
        projectService.submitPeerReviews(user, project.id, dto),
      ).rejects.toThrow();
    });
  });

  describe('submit manager review', () => {
    let user: UserEntity;
    let project: ProjectEntity;

    beforeEach(() => {
      user = entityFaker.user();
      project = entityFaker.project(user.id);
      project.state = ProjectState.MANAGER_REVIEW;

      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);
      jest.spyOn(projectRepository, 'update').mockResolvedValue();
    });

    test('happy path', async () => {
      await expect(
        projectService.submitManagerReview(user, project.id),
      ).resolves.not.toThrow();
      expect(project.state).toBe(ProjectState.FINISHED);
      expect(projectRepository.update).toHaveBeenCalledWith(project);
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
