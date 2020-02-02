import { ContributionsModelService } from 'project/domain/ContributionsModelService';
import { ConsensualityModelService } from 'project/domain/ConsensualityModelService';
import { UserModel, UserFakeRepository } from 'user';
import { ProjectModel, ProjectState } from 'project/domain/ProjectModel';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import {
  RoleModel,
  RoleRepository,
  PeerReviewRepository,
  FakeRoleRepository,
  FakePeerReviewRepository,
} from 'role';
import { ModelFaker, PrimitiveFaker } from 'test';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import {
  GetProjectsQueryDto,
  GetProjectsType,
} from 'project/application/dto/GetProjectsQueryDto';
import { UpdateProjectDto } from 'project/application/dto/UpdateProjectDto';
import { SubmitPeerReviewsDto } from 'project/application/dto/SubmitPeerReviewsDto';
import { ProjectFakeRepository } from 'project/infrastructure/ProjectFakeRepository';
import { MockEventPublisherService } from 'event';
import { ProjectDomainService } from 'project/domain/ProjectDomainService';
import { CreateProjectDto } from 'project/application/dto/CreateProjectDto';
import { ProjectModelFactoryService } from 'project/domain/ProjectModelFactoryService';

describe('project application service', () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;

  let eventPublisher: MockEventPublisherService;
  let userRepository: UserFakeRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let peerReviewRepository: PeerReviewRepository;
  let contributionsModelService: ContributionsModelService;
  let consensualityModelService: ConsensualityModelService;
  let projectModelFactory: ProjectModelFactoryService;
  let projectDomainService: ProjectDomainService;
  let projectApplicationService: ProjectApplicationService;
  let ownerUser: UserModel;
  let project: ProjectModel;
  let projectDto: ProjectDto;

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
    projectModelFactory = new ProjectModelFactoryService();
    projectDomainService = new ProjectDomainService(
      eventPublisher,
      projectRepository,
      roleRepository,
      peerReviewRepository,
      contributionsModelService,
      consensualityModelService,
      projectModelFactory,
    );
    projectApplicationService = new ProjectApplicationService(
      projectRepository,
      roleRepository,
      projectDomainService,
    );

    ownerUser = modelFaker.user();
    await userRepository.persist(ownerUser);
    project = modelFaker.project(ownerUser.id);
    await projectRepository.persist(project);
    projectDto = ProjectDto.builder()
      .project(project)
      .authUser(ownerUser)
      .build();
  });

  test('should be defined', () => {
    expect(projectApplicationService).toBeDefined();
  });

  describe('get created projects', () => {
    let projects: ProjectModel[];
    let query: GetProjectsQueryDto;

    beforeEach(async () => {
      projects = [
        modelFaker.project(ownerUser.id),
        modelFaker.project(ownerUser.id),
        modelFaker.project(ownerUser.id),
      ];
      await projectRepository.persist(...projects);
      query = new GetProjectsQueryDto(GetProjectsType.CREATED);
    });

    test('happy path', async () => {
      const expectedProjectDtos = projects.map(project =>
        ProjectDto.builder()
          .project(project)
          .authUser(ownerUser)
          .build(),
      );
      const actualProjectDtos = await projectApplicationService.getProjects(
        ownerUser,
        query,
      );
      for (const expectedProjectDto of expectedProjectDtos) {
        expect(actualProjectDtos).toContainEqual(expectedProjectDto);
      }
    });
  });

  describe('get assigned projects', () => {
    let projects: ProjectModel[];
    let assigneeUser: UserModel;
    let roles: RoleModel[];
    let query: GetProjectsQueryDto;

    beforeEach(async () => {
      projects = [
        modelFaker.project(ownerUser.id),
        modelFaker.project(ownerUser.id),
        modelFaker.project(ownerUser.id),
      ];
      await projectRepository.persist(...projects);
      assigneeUser = modelFaker.user();
      await userRepository.persist(assigneeUser);
      roles = [
        modelFaker.role(projects[0].id, assigneeUser.id),
        modelFaker.role(projects[1].id, assigneeUser.id),
        modelFaker.role(projects[2].id, assigneeUser.id),
      ];
      await roleRepository.persist(...roles);
      query = new GetProjectsQueryDto(GetProjectsType.ASSIGNED);
    });

    test('happy path', async () => {
      const expectedProjectDtos = projects.map(project =>
        ProjectDto.builder()
          .project(project)
          .authUser(ownerUser)
          .build(),
      );
      const actualProjectDtos = await projectApplicationService.getProjects(
        assigneeUser,
        query,
      );
      for (const expectedProjectDto of expectedProjectDtos) {
        expect(actualProjectDtos).toContainEqual(expectedProjectDto);
      }
    });
  });

  describe('get project', () => {
    test('happy path', async () => {
      await expect(
        projectApplicationService.getProject(ownerUser, project.id),
      ).resolves.toEqual(projectDto);
    });
  });

  describe('create project', () => {
    let title: string;
    let description: string;
    let createProjectDto: CreateProjectDto;

    beforeEach(() => {
      title = primitiveFaker.words();
      description = primitiveFaker.paragraph();
      createProjectDto = new CreateProjectDto(title, description);
      jest.spyOn(projectDomainService, 'createProject');
    });

    test('happy path', async () => {
      await projectApplicationService.createProject(
        ownerUser,
        createProjectDto,
      );
      expect(projectDomainService.createProject).toHaveBeenCalledWith(
        createProjectDto,
        ownerUser,
      );
    });
  });

  describe('update project', () => {
    let title: string;
    let updateProjectDto: UpdateProjectDto;

    beforeEach(async () => {
      project.state = ProjectState.FORMATION;
      await projectRepository.persist(project);
      title = primitiveFaker.words();
      updateProjectDto = new UpdateProjectDto(title);
      jest.spyOn(projectDomainService, 'updateProject');
    });

    test('happy path', async () => {
      await projectApplicationService.updateProject(
        ownerUser,
        project.id,
        updateProjectDto,
      );
      expect(projectDomainService.updateProject).toHaveBeenCalledWith(
        project,
        updateProjectDto,
      );
    });

    test('should fail if non-owner updates project', async () => {
      const notOwnerUser = modelFaker.user();
      await userRepository.persist(notOwnerUser);
      await expect(
        projectApplicationService.updateProject(
          notOwnerUser,
          project.id,
          updateProjectDto,
        ),
      ).rejects.toThrow();
      expect(projectDomainService.updateProject).not.toHaveBeenCalled();
    });
  });

  describe('finish formation', () => {
    let role1: RoleModel;
    let role2: RoleModel;
    let role3: RoleModel;

    beforeEach(async () => {
      project.state = ProjectState.FORMATION;
      await projectRepository.persist(project);
      role1 = modelFaker.role(project.id, ownerUser.id);
      role2 = modelFaker.role(project.id, ownerUser.id);
      role3 = modelFaker.role(project.id, ownerUser.id);
      await roleRepository.persist(role1, role2, role3);
      jest.spyOn(projectDomainService, 'finishFormation');
    });

    test('happy path', async () => {
      await projectApplicationService.finishFormation(ownerUser, project.id);
      expect(projectDomainService.finishFormation).toHaveBeenCalledWith(
        project,
      );
    });

    test('should fail if authenticated user is ot project owner', async () => {
      const notOwnerUser = modelFaker.user();
      await userRepository.persist(notOwnerUser);
      await expect(
        projectApplicationService.finishFormation(notOwnerUser, project.id),
      ).rejects.toThrow();
      expect(projectDomainService.finishFormation).not.toHaveBeenCalled();
    });
  });

  describe('delete project', () => {
    beforeEach(() => {
      jest.spyOn(projectDomainService, 'deleteProject');
    });

    test('happy path', async () => {
      await projectApplicationService.deleteProject(ownerUser, project.id);
      expect(projectDomainService.deleteProject).toHaveBeenCalledWith(project);
    });

    test('should fail if authenticated user is ot project owner', async () => {
      const notOwnerUser = modelFaker.user();
      await userRepository.persist(notOwnerUser);
      await expect(
        projectApplicationService.deleteProject(notOwnerUser, project.id),
      ).rejects.toThrow();
      expect(projectDomainService.deleteProject).not.toHaveBeenCalled();
    });
  });

  describe('submit peer reviews', () => {
    let roles: RoleModel[];
    let submitPeerReviewsDto: SubmitPeerReviewsDto;

    beforeEach(async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      roles = [
        modelFaker.role(project.id, ownerUser.id),
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

      submitPeerReviewsDto = new SubmitPeerReviewsDto({
        [roles[1].id]: 1 / 3,
        [roles[2].id]: 1 / 3,
        [roles[3].id]: 1 / 3,
      });
      jest.spyOn(projectDomainService, 'submitPeerReviews');
    });

    describe('happy path', () => {
      test('final peer review', async () => {
        await projectApplicationService.submitPeerReviews(
          ownerUser,
          project.id,
          submitPeerReviewsDto,
        );
        expect(projectDomainService.submitPeerReviews).toHaveBeenCalledWith(
          project,
          roles,
          roles[0],
          expect.any(Map),
        );
      });

      test('should fail if authenticated user is not a project peer', async () => {
        const nonPeerUser = modelFaker.user();
        await userRepository.persist(nonPeerUser);
        await expect(
          projectApplicationService.submitPeerReviews(
            nonPeerUser,
            project.id,
            submitPeerReviewsDto,
          ),
        ).rejects.toThrow();
        expect(projectDomainService.submitPeerReviews).not.toHaveBeenCalled();
      });
    });

    describe('submit manager review', () => {
      beforeEach(async () => {
        project.state = ProjectState.MANAGER_REVIEW;
        await projectRepository.persist(project);
        jest.spyOn(projectDomainService, 'submitManagerReview');
      });

      test('happy path', async () => {
        await projectApplicationService.submitManagerReview(
          ownerUser,
          project.id,
        );
        expect(projectDomainService.submitManagerReview).toHaveBeenCalledWith(
          project,
        );
      });

      test('should fail if authenticated user is not project owner', async () => {
        const otherUser = modelFaker.user();
        await expect(
          projectApplicationService.submitManagerReview(otherUser, project.id),
        ).rejects.toThrow();
        expect(projectDomainService.submitManagerReview).not.toHaveBeenCalled();
      });
    });
  });
});
