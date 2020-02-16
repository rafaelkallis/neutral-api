import { ContributionsModelService } from 'project/domain/ContributionsModelService';
import { ConsensualityModelService } from 'project/domain/ConsensualityModelService';
import { UserModel, UserFakeRepository } from 'user';
import { ProjectModel } from 'project/domain/ProjectModel';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import {
  RoleModel,
  RoleRepository,
  PeerReviewRepository,
  FakeRoleRepository,
  FakePeerReviewRepository,
  PeerReviewModel,
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
import { PeerReviewModelFactoryService } from 'role/domain/PeerReviewModelFactoryService';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { GetRolesQueryDto } from 'project/application/GetRolesQueryDto';
import { RoleDto } from 'project/application/dto/RoleDto';

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
  let peerReviewModelFactory: PeerReviewModelFactoryService;
  let projectDomainService: ProjectDomainService;
  let projectApplication: ProjectApplicationService;
  let ownerUser: UserModel;
  let project: ProjectModel;
  let roles: RoleModel[];
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
    projectApplication = new ProjectApplicationService(
      projectRepository,
      roleRepository,
      userRepository,
      peerReviewRepository,
      eventPublisher,
    );

    ownerUser = modelFaker.user();
    await userRepository.persist(ownerUser);
    project = modelFaker.project(ownerUser.id);
    await projectRepository.persist(project);
    roles = [modelFaker.role(project.id), modelFaker.role(project.id)];
    await roleRepository.persist(...roles);
    projectDto = ProjectDto.builder()
      .project(project)
      .authUser(ownerUser)
      .build();
  });

  test('should be defined', () => {
    expect(projectApplication).toBeDefined();
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
      const actualProjectDtos = await projectApplication.getProjects(
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
      const actualProjectDtos = await projectApplication.getProjects(
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
        projectApplication.getProject(ownerUser, project.id.value),
      ).resolves.toEqual(projectDto);
    });
  });

  describe('get roles', () => {
    let getRolesQueryDto: GetRolesQueryDto;

    beforeEach(() => {
      getRolesQueryDto = new GetRolesQueryDto(project.id.value);
    });

    test('happy path', async () => {
      const actualRoleDtos = await projectApplication.getRoles(
        ownerUser,
        getRolesQueryDto,
      );
      const expectedRoleDtos = [
        await RoleDto.builder()
          .role(roles[0])
          .project(project)
          .projectRoles(roles)
          .authUser(ownerUser)
          .build(),
        await RoleDto.builder()
          .role(roles[1])
          .project(project)
          .projectRoles(roles)
          .authUser(ownerUser)
          .build(),
      ];
      expect(actualRoleDtos).toEqual(expectedRoleDtos);
    });
  });

  describe('get role', () => {
    let sentPeerReview: PeerReviewModel;

    beforeEach(async () => {
      sentPeerReview = modelFaker.peerReview(roles[0].id, roles[1].id);
      await peerReviewRepository.persist(sentPeerReview);
    });

    test('happy path', async () => {
      const actualRoleDto = await projectApplication.getRole(
        ownerUser,
        roles[0].id.value,
      );
      const expectedRoleDto = await RoleDto.builder()
        .role(roles[0])
        .project(project)
        .projectRoles(roles)
        .authUser(ownerUser)
        .addSubmittedPeerReviews(async () => [sentPeerReview])
        .build();
      expect(actualRoleDto).toEqual(expectedRoleDto);
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
      await projectApplication.createProject(ownerUser, createProjectDto);
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
      await projectApplication.updateProject(
        ownerUser,
        project.id.value,
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
        projectApplication.updateProject(
          notOwnerUser,
          project.id.value,
          updateProjectDto,
        ),
      ).rejects.toThrow();
      expect(projectDomainService.updateProject).not.toHaveBeenCalled();
    });
  });

  describe('create role', () => {
    let title: string;
    let description: string;

    beforeEach(() => {
      title = primitiveFaker.words();
      description = primitiveFaker.paragraph();
      jest.spyOn(project, 'addRole');
    });

    test('happy path', async () => {
      await projectApplication.addRole(
        ownerUser,
        project.id.value,
        title,
        description,
      );
      expect(project.addRole).toHaveBeenCalledWith(
        { title, description },
        roles,
      );
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = modelFaker.user();
      await userRepository.persist(otherUser);
      await expect(
        projectApplication.addRole(
          otherUser,
          project.id.value,
          title,
          description,
        ),
      ).rejects.toThrow();
      expect(project.addRole).not.toHaveBeenCalled();
    });
  });

  describe('update role', () => {
    let newTitle: string;

    beforeEach(() => {
      newTitle = primitiveFaker.words();
      jest.spyOn(project, 'updateRole');
    });

    test('happy path', async () => {
      await projectApplication.updateRole(
        ownerUser,
        roles[0].id.value,
        newTitle,
      );
      expect(project.updateRole).toHaveBeenCalledWith(roles[0], newTitle);
      expect(roles[0].title).toEqual(newTitle);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const nonOwnerUser = modelFaker.user();
      await userRepository.persist(nonOwnerUser);
      await expect(
        projectApplication.updateRole(
          nonOwnerUser,
          roles[0].id.value,
          newTitle,
        ),
      ).rejects.toThrow();
      expect(project.updateRole).not.toHaveBeenCalled();
    });
  });

  describe('delete role', () => {
    beforeEach(() => {
      jest.spyOn(project, 'removeRole');
    });

    test('happy path', async () => {
      await projectApplication.removeRole(ownerUser, roles[0].id.value);
      expect(project.removeRole).toHaveBeenCalledWith(project, roles[0], roles);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const nonOwnerUser = modelFaker.user();
      await userRepository.persist(nonOwnerUser);
      await expect(
        projectApplication.removeRole(nonOwnerUser, roles[0].id.value),
      ).rejects.toThrow();
      expect(project.removeRole).not.toHaveBeenCalled();
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
      await projectApplication.finishFormation(ownerUser, project.id.value);
      expect(projectDomainService.finishFormation).toHaveBeenCalledWith(
        project,
      );
    });

    test('should fail if authenticated user is ot project owner', async () => {
      const notOwnerUser = modelFaker.user();
      await userRepository.persist(notOwnerUser);
      await expect(
        projectApplication.finishFormation(notOwnerUser, project.id.value),
      ).rejects.toThrow();
      expect(projectDomainService.finishFormation).not.toHaveBeenCalled();
    });
  });

  describe('delete project', () => {
    beforeEach(() => {
      jest.spyOn(projectDomainService, 'deleteProject');
    });

    test('happy path', async () => {
      await projectApplication.deleteProject(ownerUser, project.id.value);
      expect(projectDomainService.deleteProject).toHaveBeenCalledWith(project);
    });

    test('should fail if authenticated user is ot project owner', async () => {
      const notOwnerUser = modelFaker.user();
      await userRepository.persist(notOwnerUser);
      await expect(
        projectApplication.deleteProject(notOwnerUser, project.id.value),
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
        [roles[1].id.value]: 1 / 3,
        [roles[2].id.value]: 1 / 3,
        [roles[3].id.value]: 1 / 3,
      });
      jest.spyOn(projectDomainService, 'submitPeerReviews');
    });

    describe('happy path', () => {
      test('final peer review', async () => {
        await projectApplication.submitPeerReviews(
          ownerUser,
          project.id.value,
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
          projectApplication.submitPeerReviews(
            nonPeerUser,
            project.id.value,
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
        await projectApplication.submitManagerReview(
          ownerUser,
          project.id.value,
        );
        expect(projectDomainService.submitManagerReview).toHaveBeenCalledWith(
          project,
        );
      });

      test('should fail if authenticated user is not project owner', async () => {
        const otherUser = modelFaker.user();
        await expect(
          projectApplication.submitManagerReview(otherUser, project.id.value),
        ).rejects.toThrow();
        expect(projectDomainService.submitManagerReview).not.toHaveBeenCalled();
      });
    });
  });
});
