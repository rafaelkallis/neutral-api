import td from 'testdouble';
import { Project, ReadonlyProject } from 'project/domain/project/Project';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import {
  GetProjectsQueryDto,
  GetProjectsType,
} from 'project/application/dto/GetProjectsQueryDto';
import { SubmitPeerReviewsDto } from 'project/application/dto/SubmitPeerReviewsDto';
import { ProjectFormation } from 'project/domain/project/value-objects/states/ProjectFormation';
import { ProjectPeerReview } from 'project/domain/project/value-objects/states/ProjectPeerReview';
import { ProjectManagerReview } from 'project/domain/project/value-objects/states/ProjectManagerReview';
import { Role, ReadonlyRole } from 'project/domain/role/Role';
import { User } from 'user/domain/User';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { FakeContributionsComputerService } from 'project/infrastructure/FakeContributionsComputerService';
import { FakeConsensualityComputerService } from 'project/infrastructure/FakeConsensualityComputer';
import { HasSubmittedPeerReviews } from 'project/domain/role/value-objects/HasSubmittedPeerReviews';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleCollection } from 'project/domain/role/RoleCollection';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { UserRepository } from 'user/domain/UserRepository';
import { MemoryUserRepository } from 'user/infrastructure/MemoryUserRepository';
import { MemoryProjectRepository } from 'project/infrastructure/MemoryProjectRepository';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { ProjectFinished } from 'project/domain/project/value-objects/states/ProjectFinished';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { UserFactory } from 'user/application/UserFactory';
import { Email } from 'user/domain/value-objects/Email';
import { InitialState } from 'user/domain/value-objects/states/InitialState';

describe(ProjectApplicationService.name, () => {
  let scenario: UnitTestScenario<ProjectApplicationService>;
  let projectApplication: ProjectApplicationService;

  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let objectMapper: ObjectMapper;
  let contributionsComputer: ContributionsComputer;
  let consensualityComputer: ConsensualityComputer;
  let creatorUser: User;
  let project: Project;
  let roles: Role[];
  let expectedProjectDto: unknown;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(ProjectApplicationService)
      .addProviderValue(ProjectRepository, new MemoryProjectRepository())
      .addProviderValue(UserRepository, new MemoryUserRepository())
      .addProviderMock(UserFactory)
      .addProviderMock(DomainEventBroker)
      .addProviderMock(ObjectMapper)
      .addProviderValue(
        ContributionsComputer,
        new FakeContributionsComputerService(),
      )
      .addProviderValue(
        ConsensualityComputer,
        new FakeConsensualityComputerService(),
      )
      .build();
    projectApplication = scenario.subject;

    userRepository = scenario.module.get(UserRepository);
    projectRepository = scenario.module.get(ProjectRepository);
    objectMapper = scenario.module.get(ObjectMapper);
    contributionsComputer = scenario.module.get(ContributionsComputer);
    consensualityComputer = scenario.module.get(ConsensualityComputer);

    creatorUser = scenario.modelFaker.user();
    await userRepository.persist(creatorUser);

    project = scenario.modelFaker.project(creatorUser.id);
    jest.spyOn(project, 'assertCreator');
    roles = [
      scenario.modelFaker.role(),
      scenario.modelFaker.role(),
      scenario.modelFaker.role(),
      scenario.modelFaker.role(),
    ];
    project.roles.addAll(roles);
    await projectRepository.persist(project);

    expectedProjectDto = td.object();
    td.when(
      objectMapper.map(
        td.matchers.isA(Project),
        ProjectDto,
        td.matchers.anything(),
      ),
    ).thenReturn(expectedProjectDto);
  });

  test('should be defined', () => {
    expect(projectApplication).toBeDefined();
  });

  describe('get created projects', () => {
    let query: GetProjectsQueryDto;
    let projects: ReadonlyProject[];
    let projectDtos: ProjectDto[];

    beforeEach(async () => {
      query = new GetProjectsQueryDto(GetProjectsType.CREATED);
      projects = [
        scenario.modelFaker.project(creatorUser.id),
        scenario.modelFaker.project(creatorUser.id),
        scenario.modelFaker.project(creatorUser.id),
      ];
      await projectRepository.persist(...projects);
      // td.when(projectRepository.findByCreatorId(ownerUser.id)).thenResolve(projects);
      projectDtos = td.object();
      td.when(
        objectMapper.mapArray(
          td.matchers.anything(),
          ProjectDto,
          td.matchers.anything(),
        ),
      ).thenReturn(projectDtos);
    });

    test('happy path', async () => {
      const actualProjectDtos = await projectApplication.getProjects(
        creatorUser,
        query,
      );
      expect(actualProjectDtos).toBe(projectDtos);
    });
  });

  describe('get assigned projects', () => {
    let projects: Project[];
    let assigneeUser: User;
    let query: GetProjectsQueryDto;
    let projectDtos: ProjectDto[];

    beforeEach(async () => {
      assigneeUser = scenario.modelFaker.user();
      await userRepository.persist(assigneeUser);
      projects = [];
      for (let i = 0; i < 3; i++) {
        projects[i] = scenario.modelFaker.project(creatorUser.id);
        projects[i].roles = new RoleCollection([
          scenario.modelFaker.role(assigneeUser.id),
        ]);
      }
      await projectRepository.persist(...projects);
      query = new GetProjectsQueryDto(GetProjectsType.ASSIGNED);
      projectDtos = td.object();
      td.when(
        objectMapper.mapArray(
          td.matchers.anything(),
          ProjectDto,
          td.matchers.anything(),
        ),
      ).thenReturn(projectDtos);
    });

    test('happy path', async () => {
      const actualProjectDtos = await projectApplication.getProjects(
        assigneeUser,
        query,
      );
      expect(actualProjectDtos).toBe(projectDtos);
    });
  });

  describe('get project', () => {
    test('happy path', async () => {
      const actualProjectDto = await projectApplication.getProject(
        creatorUser,
        project.id.value,
      );
      expect(actualProjectDto).toBe(expectedProjectDto);
    });
  });

  describe('update role', () => {
    let newTitle: RoleTitle;
    let roleToUpdate: Role;

    beforeEach(() => {
      newTitle = RoleTitle.from(scenario.primitiveFaker.words());
      roleToUpdate = roles[0];
      jest.spyOn(project, 'updateRole');
    });

    test('happy path', async () => {
      const actualProjectDto = await projectApplication.updateRole(
        creatorUser,
        project.id.value,
        roleToUpdate.id.value,
        newTitle.value,
      );
      expect(project.assertCreator).toHaveBeenCalledWith(creatorUser);
      expect(project.updateRole).toHaveBeenCalledWith(
        roleToUpdate.id,
        newTitle,
        undefined,
      );
      expect(actualProjectDto).toBe(expectedProjectDto);
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
        creatorUser,
        project.id.value,
        roleToRemove.id.value,
      );
      expect(project.assertCreator).toHaveBeenCalledWith(creatorUser);
      expect(project.removeRole).toHaveBeenCalledWith(roleToRemove.id);
    });
  });

  describe('assign user to role', () => {
    let assignee: User;
    let roleToBeAssigned: ReadonlyRole;

    beforeEach(async () => {
      assignee = scenario.modelFaker.user();
      await userRepository.persist(assignee);
      roleToBeAssigned = roles[0];
      jest.spyOn(project, 'assignUserToRole');
    });

    test('happy path', async () => {
      await projectApplication.assignUserToRole(
        creatorUser,
        project.id.value,
        roleToBeAssigned.id.value,
        assignee.id.value,
      );
      expect(project.assertCreator).toHaveBeenCalledWith(creatorUser);
      expect(roleToBeAssigned.assigneeId?.equals(assignee.id)).toBeTruthy();
    });

    test('happy path, email of user that exists', async () => {
      await projectApplication.assignUserToRole(
        creatorUser,
        project.id.value,
        roleToBeAssigned.id.value,
        undefined,
        assignee.email.value,
      );
      expect(roleToBeAssigned.assigneeId?.equals(assignee.id)).toBeTruthy();
    });

    test("happy path, email of user that doesn't exist", async () => {
      const assigneeEmail = scenario.primitiveFaker.email();
      const createdUser = scenario.modelFaker.user();
      createdUser.state = InitialState.getInstance();
      jest.spyOn(createdUser, 'invite');
      const userFactory = scenario.module.get(UserFactory);
      td.when(
        userFactory.create({ email: Email.from(assigneeEmail) }),
      ).thenReturn(createdUser);
      jest.spyOn(userRepository, 'persist');

      await projectApplication.assignUserToRole(
        creatorUser,
        project.id.value,
        roleToBeAssigned.id.value,
        undefined,
        assigneeEmail,
      );

      expect(createdUser.invite).toHaveBeenCalledWith();
      expect(userRepository.persist).toHaveBeenCalledWith(createdUser);
      expect(project.assignUserToRole).toHaveBeenCalledWith(
        createdUser,
        roleToBeAssigned.id,
      );
      // TODO check if events emitted
    });
  });

  describe('unassign role', () => {
    let roleToUnassign: Role;

    beforeEach(async () => {
      roleToUnassign = roles[0];
      const assignee = scenario.modelFaker.user();
      await userRepository.persist(assignee);
      roleToUnassign.assigneeId = assignee.id;
      await projectRepository.persist(project);
      jest.spyOn(project, 'unassignRole');
    });

    test('happy path', async () => {
      await projectApplication.unassignRole(
        creatorUser,
        project.id.value,
        roleToUnassign.id.value,
      );
      expect(project.assertCreator).toHaveBeenCalledWith(creatorUser);
      expect(project.unassignRole).toHaveBeenCalledWith(roleToUnassign.id);
    });
  });

  describe('finish formation', () => {
    let assignees: User[];
    beforeEach(async () => {
      assignees = [];
      for (const role of roles) {
        const assignee = scenario.modelFaker.user();
        role.assigneeId = assignee.id;
        assignees.push(assignee);
        await userRepository.persist(assignee);
      }
      project.state = ProjectFormation.INSTANCE;
      jest.spyOn(project, 'finishFormation');
    });

    test('happy path', async () => {
      await projectApplication.finishFormation(creatorUser, project.id.value);
      expect(project.assertCreator).toHaveBeenCalledWith(creatorUser);
      expect(project.finishFormation).toHaveBeenCalledWith();
    });
  });

  describe('submit peer reviews', () => {
    let submitPeerReviewsDto: SubmitPeerReviewsDto;

    beforeEach(async () => {
      project.state = ProjectPeerReview.INSTANCE;
      roles = [
        scenario.modelFaker.role(creatorUser.id),
        scenario.modelFaker.role(),
        scenario.modelFaker.role(),
        scenario.modelFaker.role(),
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
          const peerReview = scenario.modelFaker.peerReview(
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
          creatorUser,
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
        const nonPeerUser = scenario.modelFaker.user();
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
      beforeEach(() => {
        project.state = ProjectManagerReview.INSTANCE;
        jest.spyOn(project, 'submitManagerReview');
      });

      test('happy path', async () => {
        await projectApplication.submitManagerReview(
          creatorUser,
          project.id.value,
        );
        expect(project.assertCreator).toHaveBeenCalledWith(creatorUser);
        expect(project.submitManagerReview).toHaveBeenCalledWith();
      });
    });
  });

  describe('cancel project', () => {
    beforeEach(() => {
      jest.spyOn(project, 'cancel');
    });

    test('happy path', async () => {
      await projectApplication.cancelProject(creatorUser, project.id.value);
      expect(project.assertCreator).toHaveBeenCalledWith(creatorUser);
      expect(project.cancel).toHaveBeenCalledWith();
    });
  });

  describe('archive project', () => {
    beforeEach(() => {
      project.state = ProjectFinished.INSTANCE;
      jest.spyOn(project, 'archive');
    });

    test('happy path', async () => {
      await projectApplication.archiveProject(creatorUser, project.id.value);
      expect(project.assertCreator).toHaveBeenCalledWith(creatorUser);
      expect(project.archive).toHaveBeenCalledWith();
    });
  });
});
