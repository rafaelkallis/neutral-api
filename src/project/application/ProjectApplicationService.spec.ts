import { Project } from 'project/domain/Project';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import {
  GetProjectsQueryDto,
  GetProjectsType,
} from 'project/application/dto/GetProjectsQueryDto';
import { UpdateProjectDto } from 'project/application/dto/UpdateProjectDto';
import { SubmitPeerReviewsDto } from 'project/application/dto/SubmitPeerReviewsDto';
import { ProjectFakeRepository } from 'project/infrastructure/ProjectFakeRepository';
import { CreateProjectDto } from 'project/application/dto/CreateProjectDto';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { GetRolesQueryDto } from 'project/application/dto/GetRolesQueryDto';
import { RoleDto } from 'project/application/dto/RoleDto';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { Role } from 'project/domain/Role';
import { PeerReview } from 'project/domain/PeerReview';
import { UserFakeRepository } from 'user/infrastructure/UserFakeRepository';
import { User } from 'user/domain/User';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { FakeContributionsComputerService } from 'project/infrastructure/FakeContributionsComputerService';
import { FakeConsensualityComputerService } from 'project/infrastructure/FakeConsensualityComputer';
import { HasSubmittedPeerReviews } from 'project/domain/value-objects/HasSubmittedPeerReviews';
import { RoleTitle } from 'project/domain/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/value-objects/RoleDescription';
import { RoleCollection } from 'project/domain/RoleCollection';
import { FakeEventPublisherService } from 'event/publisher/FakeEventPublisherService';
import { ModelFaker } from 'test/ModelFaker';
import { PrimitiveFaker } from 'test/PrimitiveFaker';

describe('project application service', () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;

  let eventPublisher: FakeEventPublisherService;
  let userRepository: UserFakeRepository;
  let projectRepository: ProjectRepository;
  let contributionsComputer: ContributionsComputer;
  let consensualityComputer: ConsensualityComputer;
  let projectApplication: ProjectApplicationService;
  let ownerUser: User;
  let project: Project;
  let roles: Role[];
  let projectDto: ProjectDto;

  beforeEach(async () => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();

    eventPublisher = new FakeEventPublisherService();
    userRepository = new UserFakeRepository();
    projectRepository = new ProjectFakeRepository();
    contributionsComputer = new FakeContributionsComputerService();
    consensualityComputer = new FakeConsensualityComputerService();
    projectApplication = new ProjectApplicationService(
      projectRepository,
      userRepository,
      eventPublisher,
      contributionsComputer,
      consensualityComputer,
    );

    ownerUser = modelFaker.user();
    await userRepository.persist(ownerUser);

    project = modelFaker.project(ownerUser.id);
    roles = [modelFaker.role(project.id), modelFaker.role(project.id)];
    project.roles = new RoleCollection(roles);
    await projectRepository.persist(project);

    projectDto = ProjectDto.builder()
      .project(project)
      .authUser(ownerUser)
      .build();
  });

  test('should be defined', () => {
    expect(projectApplication).toBeDefined();
  });

  describe('get created projects', () => {
    let projects: Project[];
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
    let projects: Project[];
    let assigneeUser: User;
    let query: GetProjectsQueryDto;

    beforeEach(async () => {
      assigneeUser = modelFaker.user();
      await userRepository.persist(assigneeUser);
      projects = [];
      for (let i = 0; i < 3; i++) {
        projects[i] = modelFaker.project(ownerUser.id);
        projects[i].roles = new RoleCollection([
          modelFaker.role(projects[i].id, assigneeUser.id),
        ]);
      }
      await projectRepository.persist(...projects);
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
    let sentPeerReview: PeerReview;

    beforeEach(() => {
      sentPeerReview = modelFaker.peerReview(roles[0].id, roles[1].id);
      project.peerReviews.add(sentPeerReview);
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
      jest.spyOn(projectRepository, 'persist');
    });

    test('happy path', async () => {
      await projectApplication.createProject(ownerUser, createProjectDto);
      expect(projectRepository.persist).toHaveBeenCalled();
    });
  });

  describe('update project', () => {
    let newTitle: ProjectTitle;
    let updateProjectDto: UpdateProjectDto;

    beforeEach(async () => {
      project.state = ProjectState.FORMATION;
      await projectRepository.persist(project);
      newTitle = ProjectTitle.from(primitiveFaker.words());
      updateProjectDto = new UpdateProjectDto(newTitle.value);
      jest.spyOn(project, 'update');
    });

    test('happy path', async () => {
      await projectApplication.updateProject(
        ownerUser,
        project.id.value,
        updateProjectDto,
      );
      expect(project.update).toHaveBeenCalledWith(newTitle, undefined);
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
      expect(project.update).not.toHaveBeenCalled();
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
        RoleTitle.from(title),
        RoleDescription.from(description),
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
    let newTitle: RoleTitle;
    let roleToUpdate: Role;

    beforeEach(() => {
      newTitle = RoleTitle.from(primitiveFaker.words());
      roleToUpdate = roles[0];
      jest.spyOn(project, 'updateRole');
    });

    test('happy path', async () => {
      await projectApplication.updateRole(
        ownerUser,
        roleToUpdate.id.value,
        newTitle.value,
      );
      expect(project.updateRole).toHaveBeenCalledWith(
        roleToUpdate.id,
        newTitle,
        undefined,
      );
      expect(roleToUpdate.title).toEqual(newTitle);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const nonOwnerUser = modelFaker.user();
      await userRepository.persist(nonOwnerUser);
      await expect(
        projectApplication.updateRole(
          nonOwnerUser,
          roles[0].id.value,
          newTitle.value,
        ),
      ).rejects.toThrow();
      expect(project.updateRole).not.toHaveBeenCalled();
    });
  });

  describe('remove role', () => {
    let roleToRemove: Role;

    beforeEach(() => {
      roleToRemove = roles[0];
      jest.spyOn(project, 'removeRole');
    });

    test('happy path', async () => {
      await projectApplication.removeRole(ownerUser, roleToRemove.id.value);
      expect(project.removeRole).toHaveBeenCalledWith(roleToRemove.id);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const nonOwnerUser = modelFaker.user();
      await userRepository.persist(nonOwnerUser);
      await expect(
        projectApplication.removeRole(nonOwnerUser, roleToRemove.id.value),
      ).rejects.toThrow();
      expect(project.removeRole).not.toHaveBeenCalled();
    });
  });

  describe('finish formation', () => {
    let assignees: User[];
    beforeEach(async () => {
      assignees = [modelFaker.user(), modelFaker.user()];
      await userRepository.persist(...assignees);
      roles[0].assigneeId = assignees[0].id;
      roles[1].assigneeId = assignees[1].id;
      project.state = ProjectState.FORMATION;
      await projectRepository.persist(project);
      jest.spyOn(project, 'finishFormation');
    });

    test('happy path', async () => {
      await projectApplication.finishFormation(ownerUser, project.id.value);
      expect(project.finishFormation).toHaveBeenCalledWith();
    });

    test('should fail if authenticated user is ot project owner', async () => {
      const notOwnerUser = modelFaker.user();
      await userRepository.persist(notOwnerUser);
      await expect(
        projectApplication.finishFormation(notOwnerUser, project.id.value),
      ).rejects.toThrow();
      expect(project.finishFormation).not.toHaveBeenCalled();
    });
  });

  describe('delete project', () => {
    beforeEach(() => {
      jest.spyOn(project, 'delete');
      jest.spyOn(projectRepository, 'delete');
    });

    test('happy path', async () => {
      await projectApplication.deleteProject(ownerUser, project.id.value);
      expect(project.delete).toHaveBeenCalledWith();
    });

    test('should fail if authenticated user is ot project owner', async () => {
      const notOwnerUser = modelFaker.user();
      await userRepository.persist(notOwnerUser);
      await expect(
        projectApplication.deleteProject(notOwnerUser, project.id.value),
      ).rejects.toThrow();
      expect(project.delete).not.toHaveBeenCalled();
    });
  });

  describe('submit peer reviews', () => {
    let submitPeerReviewsDto: SubmitPeerReviewsDto;

    beforeEach(async () => {
      project.state = ProjectState.PEER_REVIEW;
      roles = [
        modelFaker.role(project.id, ownerUser.id),
        modelFaker.role(project.id),
        modelFaker.role(project.id),
        modelFaker.role(project.id),
      ];
      project.roles = new RoleCollection(roles);
      roles[0].hasSubmittedPeerReviews = HasSubmittedPeerReviews.FALSE;
      roles[1].hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
      roles[2].hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
      roles[3].hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;

      for (const senderRole of roles) {
        for (const receiverRole of roles) {
          if (senderRole.equals(receiverRole)) {
            // no self review
            continue;
          }
          if (senderRole.equals(roles[0])) {
            continue;
          }
          const peerReview = modelFaker.peerReview(
            senderRole.id,
            receiverRole.id,
          );
          project.peerReviews.add(peerReview);
        }
      }
      await projectRepository.persist(project);

      submitPeerReviewsDto = new SubmitPeerReviewsDto({
        [roles[1].id.value]: 1 / 3,
        [roles[2].id.value]: 1 / 3,
        [roles[3].id.value]: 1 / 3,
      });
      jest.spyOn(project, 'submitPeerReviews');
    });

    describe('happy path', () => {
      test('final peer review', async () => {
        await projectApplication.submitPeerReviews(
          ownerUser,
          project.id.value,
          submitPeerReviewsDto,
        );
        expect(project.submitPeerReviews).toHaveBeenCalledWith(
          roles[0],
          expect.any(Array),
          contributionsComputer,
          consensualityComputer,
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
        expect(project.submitPeerReviews).not.toHaveBeenCalled();
      });
    });

    describe('submit manager review', () => {
      beforeEach(async () => {
        project.state = ProjectState.MANAGER_REVIEW;
        await projectRepository.persist(project);
        jest.spyOn(project, 'submitManagerReview');
      });

      test('happy path', async () => {
        await projectApplication.submitManagerReview(
          ownerUser,
          project.id.value,
        );
        expect(project.submitManagerReview).toHaveBeenCalledWith();
      });

      test('should fail if authenticated user is not project owner', async () => {
        const otherUser = modelFaker.user();
        await expect(
          projectApplication.submitManagerReview(otherUser, project.id.value),
        ).rejects.toThrow();
        expect(project.submitManagerReview).not.toHaveBeenCalled();
      });
    });
  });
});
