import { ContributionsModelService } from 'project/domain/ContributionsModelService';
import { ConsensualityModelService } from 'project/domain/ConsensualityModelService';
import { UserModel, UserRepository, UserFakeRepository } from 'user';
import { ProjectModel } from 'project/domain/ProjectModel';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import {
  RoleModel,
  RoleRepository,
  PeerReviewRepository,
  FakeRoleRepository,
  FakePeerReviewRepository,
} from 'role';
import { ModelFaker, PrimitiveFaker } from 'test';
import { ProjectFakeRepository } from 'project/infrastructure/ProjectFakeRepository';
import { MockEventPublisherService } from 'event';
import {
  ProjectDomainService,
  CreateProjectOptions,
  UpdateProjectOptions,
} from 'project/domain/ProjectDomainService';
import { PeerReviewModelFactoryService } from 'role/domain/PeerReviewModelFactoryService';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';

describe('project domain service', () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;

  let eventPublisher: MockEventPublisherService;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let peerReviewRepository: PeerReviewRepository;
  let contributionsModelService: ContributionsModelService;
  let consensualityModelService: ConsensualityModelService;
  let peerReviewModelFactory: PeerReviewModelFactoryService;
  let projectDomainService: ProjectDomainService;
  let creatorUser: UserModel;
  let project: ProjectModel;

  beforeEach(async () => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();

    eventPublisher = new MockEventPublisherService();
    userRepository = new UserFakeRepository();
    projectRepository = new ProjectFakeRepository();
    roleRepository = new FakeRoleRepository();
    peerReviewRepository = new FakePeerReviewRepository();
    contributionsModelService = new ContributionsModelService();
    consensualityModelService = new ConsensualityModelService();
    peerReviewModelFactory = new PeerReviewModelFactoryService();
    projectDomainService = new ProjectDomainService(
      eventPublisher,
      projectRepository,
      roleRepository,
      peerReviewRepository,
      contributionsModelService,
      consensualityModelService,
      peerReviewModelFactory,
    );

    creatorUser = modelFaker.user();
    await userRepository.persist(creatorUser);
    project = modelFaker.project(creatorUser.id);
    await projectRepository.persist(project);
  });

  test('should be defined', () => {
    expect(projectDomainService).toBeDefined();
  });

  describe('create project', () => {
    let title: ProjectTitle;
    let description: ProjectDescription;
    let createProjectOptions: CreateProjectOptions;

    beforeEach(() => {
      title = ProjectTitle.from(primitiveFaker.words());
      description = ProjectDescription.from(primitiveFaker.paragraph());
      createProjectOptions = { title, description };
      jest.spyOn(projectRepository, 'persist');
    });

    test('happy path', async () => {
      await projectDomainService.createProject(
        createProjectOptions,
        creatorUser,
      );
      expect(projectRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          title,
          description,
          creatorId: creatorUser.id,
        }),
      );
    });
  });

  describe('update project', () => {
    let title: string;
    let updateProjectOptions: UpdateProjectOptions;

    beforeEach(async () => {
      project.state = ProjectState.FORMATION;
      await projectRepository.persist(project);
      title = primitiveFaker.words();
      updateProjectOptions = { title };
      jest.spyOn(projectRepository, 'persist');
    });

    test('happy path', async () => {
      await projectDomainService.updateProject(project, updateProjectOptions);
      expect(projectRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          id: project.id,
          title,
        }),
      );
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      await expect(
        projectDomainService.updateProject(project, updateProjectOptions),
      ).rejects.toThrow();
    });
  });

  describe('finish formation', () => {
    let role1: RoleModel;
    let role2: RoleModel;
    let role3: RoleModel;

    beforeEach(async () => {
      project.state = ProjectState.FORMATION;
      await projectRepository.persist(project);
      role1 = modelFaker.role(project.id, creatorUser.id);
      role2 = modelFaker.role(project.id, creatorUser.id);
      role3 = modelFaker.role(project.id, creatorUser.id);
      await roleRepository.persist(role1, role2, role3);
      jest.spyOn(roleRepository, 'findByProjectId');
      jest.spyOn(projectRepository, 'persist');
    });

    test('happy path', async () => {
      await projectDomainService.finishFormation(project);
      expect(projectRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({ state: ProjectState.PEER_REVIEW }),
      );
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      await expect(
        projectDomainService.finishFormation(project),
      ).rejects.toThrow();
    });

    test('should fail if a role has no user assigned', async () => {
      role1.assigneeId = null;
      await roleRepository.persist(role1);
      await expect(
        projectDomainService.finishFormation(project),
      ).rejects.toThrow();
    });
  });

  describe('delete project', () => {
    beforeEach(() => {
      jest.spyOn(projectRepository, 'delete');
    });

    test('happy path', async () => {
      await projectDomainService.deleteProject(project);
      expect(projectRepository.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          id: project.id,
        }),
      );
    });
  });

  describe('submit peer reviews', () => {
    let roles: RoleModel[];
    let peerReviewMap: Map<string, number>;

    beforeEach(async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      roles = [
        modelFaker.role(project.id, creatorUser.id),
        modelFaker.role(project.id),
        modelFaker.role(project.id),
        modelFaker.role(project.id),
      ];
      roles[0].hasSubmittedPeerReviews = false;
      roles[1].hasSubmittedPeerReviews = true;
      roles[2].hasSubmittedPeerReviews = true;
      roles[3].hasSubmittedPeerReviews = true;
      await roleRepository.persist(...roles);

      for (const senderRole of roles) {
        for (const receiverRole of roles) {
          if (senderRole === receiverRole) {
            // no self review
            continue;
          }
          if (senderRole === roles[0]) {
            continue;
          }
          const peerReview = modelFaker.peerReview(
            senderRole.id,
            receiverRole.id,
          );
          await peerReviewRepository.persist(peerReview);
        }
      }

      peerReviewMap = new Map();
      peerReviewMap.set(roles[1].id.value, 1 / 3);
      peerReviewMap.set(roles[2].id.value, 1 / 3);
      peerReviewMap.set(roles[3].id.value, 1 / 3);

      jest.spyOn(roleRepository, 'findByProjectId');
      jest.spyOn(peerReviewRepository, 'findBySenderRoleId');
      jest.spyOn(roleRepository, 'persist');
      jest.spyOn(projectRepository, 'persist');
    });

    describe('happy path', () => {
      test('final peer review', async () => {
        await projectDomainService.submitPeerReviews(
          project,
          roles,
          roles[0],
          peerReviewMap,
        );
        expect(project.state).toBe(ProjectState.MANAGER_REVIEW);
        for (const role of roles) {
          expect(role.contribution).toEqual(expect.any(Number));
        }
        expect(project.consensuality).toEqual(expect.any(Number));
      });

      test('final peer review, should skip manager review if "skipManagerReview" is "yes"', async () => {
        project.skipManagerReview = SkipManagerReview.YES;
        await projectDomainService.submitPeerReviews(
          project,
          roles,
          roles[0],
          peerReviewMap,
        );
        expect(project.state).toBe(ProjectState.FINISHED);
      });

      test('final peer review, should skip manager review if "skipManagerReview" is "if-consensual" and reviews are consensual', async () => {
        project.skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
        jest
          .spyOn(consensualityModelService, 'isConsensual')
          .mockReturnValue(true);
        await projectDomainService.submitPeerReviews(
          project,
          roles,
          roles[0],
          peerReviewMap,
        );
        expect(project.state).toBe(ProjectState.FINISHED);
      });

      test('final peer review, should not skip manager review if "skipManagerReview" is "if-consensual" and reviews are not consensual', async () => {
        project.skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
        jest
          .spyOn(consensualityModelService, 'isConsensual')
          .mockReturnValue(false);
        await projectDomainService.submitPeerReviews(
          project,
          roles,
          roles[0],
          peerReviewMap,
        );
        expect(project.state).toBe(ProjectState.MANAGER_REVIEW);
      });

      test('final peer review, should not skip manager review if "skipManagerReview" is "no"', async () => {
        project.skipManagerReview = SkipManagerReview.NO;
        await projectDomainService.submitPeerReviews(
          project,
          roles,
          roles[0],
          peerReviewMap,
        );
        expect(project.state).toBe(ProjectState.MANAGER_REVIEW);
      });

      test('not final peer review, should not compute contributions and consensuality', async () => {
        roles[1].hasSubmittedPeerReviews = false;
        await roleRepository.persist(roles[1]);
        await projectDomainService.submitPeerReviews(
          project,
          roles,
          roles[0],
          peerReviewMap,
        );
        for (const role of roles) {
          expect(role.contribution).toBeNull();
        }
        expect(project.state).toBe(ProjectState.PEER_REVIEW);
        expect(projectRepository.persist).not.toHaveBeenCalled();
      });
    });

    test('should fail if project is not in peer-review state', async () => {
      project.state = ProjectState.FORMATION;
      await projectRepository.persist(project);
      await expect(
        projectDomainService.submitPeerReviews(
          project,
          roles,
          roles[0],
          peerReviewMap,
        ),
      ).rejects.toThrow();
    });

    test('should fail if peer reviews have been previously submitted', async () => {
      roles[0].hasSubmittedPeerReviews = true;
      await roleRepository.persist(roles[0]);
      await expect(
        projectDomainService.submitPeerReviews(
          project,
          roles,
          roles[0],
          peerReviewMap,
        ),
      ).rejects.toThrow();
    });

    test('should fail if a peer review is for non-existing peer', async () => {
      peerReviewMap.delete(roles[1].id.value);
      peerReviewMap.set(primitiveFaker.id(), 1 / 3);
      await expect(
        projectDomainService.submitPeerReviews(
          project,
          roles,
          roles[0],
          peerReviewMap,
        ),
      ).rejects.toThrow();
    });
  });

  describe('submit manager review', () => {
    beforeEach(async () => {
      project.state = ProjectState.MANAGER_REVIEW;
      await projectRepository.persist(project);
    });

    test('happy path', async () => {
      await expect(
        projectDomainService.submitManagerReview(project),
      ).resolves.not.toThrow();
      expect(project.state).toBe(ProjectState.FINISHED);
    });

    test('should fail if project is not in manager-review state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      await expect(
        projectDomainService.submitManagerReview(project),
      ).rejects.toThrow();
    });
  });
});
