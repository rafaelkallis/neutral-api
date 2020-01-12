import { ContributionsModelService } from './contributions-model.service';
import { ConsensualityModelService } from './consensuality-model.service';
import { UserEntity, FakeUserRepository, UserRepository } from 'user';
import { ProjectEntity } from 'project/entities/project.entity';
import { ProjectRepository } from 'project/repositories/project.repository';
import {
  RoleEntity,
  RoleRepository,
  PeerReviewRepository,
  FakeRoleRepository,
  FakePeerReviewRepository,
} from 'role';
import { EntityFaker, PrimitiveFaker } from 'test';
import { ProjectApplicationService } from 'project/services/project-application.service';
import { ProjectDto } from 'project/dto/project.dto';
import { CreateProjectDto } from 'project/dto/create-project.dto';
import { GetProjectsQueryDto } from 'project/dto/get-projects-query.dto';
import { UpdateProjectDto } from 'project/dto/update-project.dto';
import { SubmitPeerReviewsDto } from 'project/dto/submit-peer-reviews.dto';
import { ProjectState } from 'project/project';
import { FakeProjectRepository } from 'project/repositories/fake-project.repository';
import { MockEventPublisher } from 'event';
import { Config, MockConfig } from 'config';
import { ProjectDomainService } from 'project/services/project-domain.service';

describe('project application service', () => {
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;

  let config: Config;
  let eventPublisher: MockEventPublisher;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let peerReviewRepository: PeerReviewRepository;
  let contributionsModelService: ContributionsModelService;
  let consensualityModelService: ConsensualityModelService;
  let projectDomainService: ProjectDomainService;
  let projectApplicationService: ProjectApplicationService;
  let ownerUser: UserEntity;
  let project: ProjectEntity;
  let projectDto: ProjectDto;

  beforeEach(async () => {
    primitiveFaker = new PrimitiveFaker();
    entityFaker = new EntityFaker();

    config = new MockConfig();
    eventPublisher = new MockEventPublisher();
    userRepository = new FakeUserRepository();
    projectRepository = new FakeProjectRepository();
    roleRepository = new FakeRoleRepository();
    peerReviewRepository = new FakePeerReviewRepository();
    contributionsModelService = new ContributionsModelService();
    consensualityModelService = new ConsensualityModelService();
    projectDomainService = new ProjectDomainService(
      eventPublisher,
      projectRepository,
      roleRepository,
      peerReviewRepository,
      contributionsModelService,
      consensualityModelService,
    );
    projectApplicationService = new ProjectApplicationService(
      projectRepository,
      roleRepository,
      projectDomainService,
    );

    ownerUser = entityFaker.user();
    await userRepository.persist(ownerUser);
    project = entityFaker.project(ownerUser.id);
    await projectRepository.persist(project);
    projectDto = ProjectDto.builder()
      .project(project)
      .authUser(ownerUser)
      .build();
  });

  test('should be defined', () => {
    expect(projectApplicationService).toBeDefined();
  });

  describe('get projects', () => {
    let projects: ProjectEntity[];
    let query: GetProjectsQueryDto;

    beforeEach(async () => {
      projects = [
        entityFaker.project(ownerUser.id),
        entityFaker.project(ownerUser.id),
        entityFaker.project(ownerUser.id),
      ];
      await projectRepository.persist(...projects);
      query = GetProjectsQueryDto.from({});
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
      createProjectDto = CreateProjectDto.from({ title, description });
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
      updateProjectDto = UpdateProjectDto.from({ title });
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
      const notOwnerUser = entityFaker.user();
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
    let role1: RoleEntity;
    let role2: RoleEntity;
    let role3: RoleEntity;

    beforeEach(async () => {
      project.state = ProjectState.FORMATION;
      await projectRepository.persist(project);
      role1 = entityFaker.role(project.id, ownerUser.id);
      role2 = entityFaker.role(project.id, ownerUser.id);
      role3 = entityFaker.role(project.id, ownerUser.id);
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
      const notOwnerUser = entityFaker.user();
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
      const notOwnerUser = entityFaker.user();
      await userRepository.persist(notOwnerUser);
      await expect(
        projectApplicationService.deleteProject(notOwnerUser, project.id),
      ).rejects.toThrow();
      expect(projectDomainService.deleteProject).not.toHaveBeenCalled();
    });
  });

  describe('submit peer reviews', () => {
    let roles: RoleEntity[];
    let submitPeerReviewsDto: SubmitPeerReviewsDto;

    beforeEach(async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      roles = [
        entityFaker.role(project.id, ownerUser.id),
        entityFaker.role(project.id),
        entityFaker.role(project.id),
        entityFaker.role(project.id),
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
          const peerReview = entityFaker.peerReview(
            senderRole.id,
            receiverRole.id,
          );
          await peerReviewRepository.persist(peerReview);
        }
      }

      submitPeerReviewsDto = SubmitPeerReviewsDto.from({
        peerReviews: {
          [roles[1].id]: 1 / 3,
          [roles[2].id]: 1 / 3,
          [roles[3].id]: 1 / 3,
        },
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
        const nonPeerUser = entityFaker.user();
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
        const otherUser = entityFaker.user();
        await expect(
          projectApplicationService.submitManagerReview(otherUser, project.id),
        ).rejects.toThrow();
        expect(projectDomainService.submitManagerReview).not.toHaveBeenCalled();
      });
    });
  });
});
