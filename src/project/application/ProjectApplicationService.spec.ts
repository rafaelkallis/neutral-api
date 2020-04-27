import td from 'testdouble';
import { Project } from 'project/domain/Project';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import {
  GetProjectsQueryDto,
  GetProjectsType,
} from 'project/application/dto/GetProjectsQueryDto';
import { UpdateProjectDto } from 'project/application/dto/UpdateProjectDto';
import { SubmitPeerReviewsDto } from 'project/application/dto/SubmitPeerReviewsDto';
import { CreateProjectDto } from 'project/application/dto/CreateProjectDto';
import { ProjectFormation } from 'project/domain/value-objects/states/ProjectFormation';
import { ProjectPeerReview } from 'project/domain/value-objects/states/ProjectPeerReview';
import { ProjectManagerReview } from 'project/domain/value-objects/states/ProjectManagerReview';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { Role } from 'project/domain/Role';
import { User } from 'user/domain/User';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { FakeContributionsComputerService } from 'project/infrastructure/FakeContributionsComputerService';
import { FakeConsensualityComputerService } from 'project/infrastructure/FakeConsensualityComputer';
import { HasSubmittedPeerReviews } from 'project/domain/value-objects/HasSubmittedPeerReviews';
import { RoleTitle } from 'project/domain/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/value-objects/RoleDescription';
import { RoleCollection } from 'project/domain/RoleCollection';
import { ModelFaker } from 'test/ModelFaker';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { Mock } from 'test/Mock';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { UserRepository } from 'user/domain/UserRepository';
import { MemoryUserRepository } from 'user/infrastructure/MemoryUserRepository';
import { MemoryProjectRepository } from 'project/infrastructure/MemoryProjectRepository';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';

describe(ProjectApplicationService.name, () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;

  let domainEventBroker: DomainEventBroker;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let objectMapper: ObjectMapper;
  let contributionsComputer: ContributionsComputer;
  let consensualityComputer: ConsensualityComputer;
  let projectApplication: ProjectApplicationService;
  let ownerUser: User;
  let project: Project;
  let roles: Role[];
  let mockProjectDto: unknown;

  beforeEach(async () => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();

    domainEventBroker = td.object();
    userRepository = new MemoryUserRepository();
    projectRepository = new MemoryProjectRepository();
    objectMapper = Mock(ObjectMapper);
    contributionsComputer = new FakeContributionsComputerService();
    consensualityComputer = new FakeConsensualityComputerService();
    projectApplication = new ProjectApplicationService(
      projectRepository,
      userRepository,
      domainEventBroker,
      objectMapper,
      contributionsComputer,
      consensualityComputer,
    );

    ownerUser = modelFaker.user();
    await userRepository.persist(ownerUser);

    project = modelFaker.project(ownerUser.id);
    roles = [
      modelFaker.role(project.id),
      modelFaker.role(project.id),
      modelFaker.role(project.id),
      modelFaker.role(project.id),
    ];
    project.roles.addAll(roles);
    await projectRepository.persist(project);

    mockProjectDto = {};
    jest.spyOn(objectMapper, 'map').mockReturnValue(mockProjectDto);
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
      const projectDtos = await projectApplication.getProjects(
        ownerUser,
        query,
      );
      expect(objectMapper.map).toHaveBeenCalledWith(
        expect.any(Project),
        ProjectDto,
        {
          authUser: ownerUser,
        },
      );
      for (const projectDto of projectDtos) {
        expect(projectDto).toEqual(mockProjectDto);
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
      const projectDtos = await projectApplication.getProjects(
        assigneeUser,
        query,
      );
      expect(objectMapper.map).toHaveBeenCalledWith(
        expect.any(Project),
        ProjectDto,
        {
          authUser: assigneeUser,
        },
      );
      for (const projectDto of projectDtos) {
        expect(projectDto).toEqual(mockProjectDto);
      }
    });
  });

  describe('get project', () => {
    test('happy path', async () => {
      await expect(
        projectApplication.getProject(ownerUser, project.id.value),
      ).resolves.toEqual(mockProjectDto);
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
      project.state = ProjectFormation.INSTANCE;
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
      const projectDto = await projectApplication.updateRole(
        ownerUser,
        project.id.value,
        roleToUpdate.id.value,
        newTitle.value,
      );
      expect(project.updateRole).toHaveBeenCalledWith(
        roleToUpdate.id,
        newTitle,
        undefined,
      );
      expect(roleToUpdate.title).toEqual(newTitle);
      expect(projectDto).toEqual(mockProjectDto);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const nonOwnerUser = modelFaker.user();
      await userRepository.persist(nonOwnerUser);
      await expect(
        projectApplication.updateRole(
          nonOwnerUser,
          project.id.value,
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
      await projectApplication.removeRole(
        ownerUser,
        project.id.value,
        roleToRemove.id.value,
      );
      expect(project.removeRole).toHaveBeenCalledWith(roleToRemove.id);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const nonOwnerUser = modelFaker.user();
      await userRepository.persist(nonOwnerUser);
      await expect(
        projectApplication.removeRole(
          nonOwnerUser,
          project.id.value,
          roleToRemove.id.value,
        ),
      ).rejects.toThrow();
      expect(project.removeRole).not.toHaveBeenCalled();
    });
  });

  describe('assign user to role', () => {
    let assignee: User;

    beforeEach(async () => {
      assignee = modelFaker.user();
      await userRepository.persist(assignee);
    });

    test('happy path', async () => {
      await projectApplication.assignUserToRole(
        ownerUser,
        project.id.value,
        roles[0].id.value,
        assignee.id.value,
      );
      expect(roles[0].assigneeId?.equals(assignee.id)).toBeTruthy();
    });

    test('happy path, email of user that exists', async () => {
      await projectApplication.assignUserToRole(
        ownerUser,
        project.id.value,
        roles[0].id.value,
        undefined,
        assignee.email.value,
      );
      expect(roles[0].assigneeId?.equals(assignee.id)).toBeTruthy();
    });

    test("happy path, email of user that doesn't exist", async () => {
      const assigneeEmail = primitiveFaker.email();
      await projectApplication.assignUserToRole(
        ownerUser,
        project.id.value,
        roles[0].id.value,
        undefined,
        assigneeEmail,
      );
      // TODO check if events emitted
    });

    test('should fail if authenticated user is not project owner', async () => {
      const notCreatorUser = modelFaker.user();
      await userRepository.persist(notCreatorUser);
      await expect(
        projectApplication.assignUserToRole(
          notCreatorUser,
          project.id.value,
          roles[0].id.value,
          assignee.id.value,
        ),
      ).rejects.toThrowError();
    });
  });

  describe('finish formation', () => {
    let assignees: User[];
    beforeEach(async () => {
      assignees = [];
      for (const role of roles) {
        const assignee = await modelFaker.user();
        role.assigneeId = assignee.id;
        assignees.push(assignee);
        await userRepository.persist(assignee);
      }
      project.state = ProjectFormation.INSTANCE;
      await projectRepository.persist(project);
      jest.spyOn(project, 'finishFormation');
    });

    test('happy path', async () => {
      await projectApplication.finishFormation(ownerUser, project.id.value);
      expect(project.finishFormation).toHaveBeenCalled();
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

  describe('archive project', () => {
    beforeEach(() => {
      jest.spyOn(project, 'archive');
    });

    test('happy path', async () => {
      await projectApplication.archiveProject(ownerUser, project.id.value);
      expect(project.archive).toHaveBeenCalledWith();
    });

    test('should fail if authenticated user is ot project owner', async () => {
      const notOwnerUser = modelFaker.user();
      await userRepository.persist(notOwnerUser);
      await expect(
        projectApplication.archiveProject(notOwnerUser, project.id.value),
      ).rejects.toThrow();
      expect(project.archive).not.toHaveBeenCalled();
    });
  });

  describe('submit peer reviews', () => {
    let submitPeerReviewsDto: SubmitPeerReviewsDto;

    beforeEach(async () => {
      project.state = ProjectPeerReview.INSTANCE;
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
          roles[0].id,
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
        project.state = ProjectManagerReview.INSTANCE;
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
