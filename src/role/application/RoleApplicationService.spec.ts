import { UserModel, UserRepository, UserFakeRepository } from 'user';
import {
  ProjectModel,
  ProjectRepository,
  ProjectFakeRepository,
} from 'project';
import { RoleModel } from 'role/domain/RoleModel';
import { PeerReviewModel } from 'role/peer-review.model';
import { RoleDto } from 'role/application/dto/RoleDto';
import { RoleRepository } from 'role/domain/RoleRepository';
import { PeerReviewRepository } from 'role/domain/PeerReviewRepository';
import { ModelFaker, PrimitiveFaker } from 'test';
import { GetRolesQueryDto } from 'role/application/dto/GetRolesQueryDto';
import { CreateRoleDto } from 'role/application/dto/CreateRoleDto';
import { UpdateRoleDto } from 'role/application/dto/UpdateRoleDto';
import { AssignmentDto } from 'role/application/dto/AssignmentDto';
import { FakePeerReviewRepository } from 'role/infrastructure/PeerReviewFakeRepository';
import { MockEventPublisherService } from 'event';
import { RoleDomainService } from 'role/domain/RoleDomainService';
import { RoleApplicationService } from 'role/application/RoleApplicationService';
import { MockEmailService } from 'email';
import { FakeRoleRepository } from 'role/infrastructure/RoleFakeRepository';

describe('role application service', () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;

  let eventPublisher: MockEventPublisherService;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let peerReviewRepository: PeerReviewRepository;
  let emailService: MockEmailService;

  let roleDomain: RoleDomainService;
  let roleApplication: RoleApplicationService;

  let ownerUser: UserModel;
  let project: ProjectModel;
  let roles: RoleModel[];

  beforeEach(async () => {
    modelFaker = new ModelFaker();
    primitiveFaker = new PrimitiveFaker();

    eventPublisher = new MockEventPublisherService();
    userRepository = new UserFakeRepository();
    projectRepository = new ProjectFakeRepository();
    roleRepository = new FakeRoleRepository();
    peerReviewRepository = new FakePeerReviewRepository();
    emailService = new MockEmailService();

    roleDomain = new RoleDomainService(
      eventPublisher,
      userRepository,
      roleRepository,
      emailService,
    );
    roleApplication = new RoleApplicationService(
      roleDomain,
      userRepository,
      projectRepository,
      roleRepository,
      peerReviewRepository,
    );

    ownerUser = modelFaker.user();
    await userRepository.persist(ownerUser);
    project = modelFaker.project(ownerUser.id);
    await projectRepository.persist(project);
    roles = [modelFaker.role(project.id), modelFaker.role(project.id)];
    await roleRepository.persist(...roles);
  });

  test('should be defined', () => {
    expect(roleApplication).toBeDefined();
  });

  describe('get roles', () => {
    let getRolesQueryDto: GetRolesQueryDto;

    beforeEach(() => {
      getRolesQueryDto = new GetRolesQueryDto(project.id);
    });

    test('happy path', async () => {
      const actualRoleDtos = await roleApplication.getRoles(
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
      const actualRoleDto = await roleApplication.getRole(
        ownerUser,
        roles[0].id,
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

  describe('create role', () => {
    let title: string;
    let description: string;
    let createRoleDto: CreateRoleDto;

    beforeEach(() => {
      title = primitiveFaker.words();
      description = primitiveFaker.paragraph();
      createRoleDto = new CreateRoleDto(
        project.id,
        undefined,
        title,
        description,
      );
      jest.spyOn(roleDomain, 'createRole');
    });

    test('happy path', async () => {
      await roleApplication.createRole(ownerUser, createRoleDto);
      expect(roleDomain.createRole).toHaveBeenCalledWith(
        createRoleDto,
        project,
      );
    });

    test('should fail if authenticated user is not project owner', async () => {
      const otherUser = modelFaker.user();
      await userRepository.persist(otherUser);
      await expect(
        roleApplication.createRole(otherUser, createRoleDto),
      ).rejects.toThrow();
      expect(roleDomain.createRole).not.toHaveBeenCalled();
    });
  });

  describe('update role', () => {
    let newTitle: string;
    let updateRoleDto: UpdateRoleDto;

    beforeEach(() => {
      newTitle = primitiveFaker.words();
      updateRoleDto = new UpdateRoleDto(newTitle);
      jest.spyOn(roleDomain, 'updateRole');
    });

    test('happy path', async () => {
      const actualRoleDto = await roleApplication.updateRole(
        ownerUser,
        roles[0].id,
        updateRoleDto,
      );
      expect(roleDomain.updateRole).toHaveBeenCalledWith(
        project,
        roles[0],
        updateRoleDto,
      );
      expect(actualRoleDto).toEqual(
        expect.objectContaining({
          title: newTitle,
        }),
      );
    });

    test('should fail if authenticated user is not project owner', async () => {
      const nonOwnerUser = modelFaker.user();
      await userRepository.persist(nonOwnerUser);
      await expect(
        roleApplication.updateRole(nonOwnerUser, roles[0].id, updateRoleDto),
      ).rejects.toThrow();
      expect(roleDomain.updateRole).not.toHaveBeenCalled();
    });
  });

  describe('delete role', () => {
    beforeEach(() => {
      jest.spyOn(roleDomain, 'deleteRole');
    });

    test('happy path', async () => {
      await roleApplication.deleteRole(ownerUser, roles[0].id);
      expect(roleDomain.deleteRole).toHaveBeenCalledWith(project, roles[0]);
    });

    test('should fail if authenticated user is not project owner', async () => {
      const nonOwnerUser = modelFaker.user();
      await userRepository.persist(nonOwnerUser);
      await expect(
        roleApplication.deleteRole(nonOwnerUser, roles[0].id),
      ).rejects.toThrow();
      expect(roleDomain.deleteRole).not.toHaveBeenCalled();
    });
  });

  describe('assign user', () => {
    let assigneeUser: UserModel;
    let assignmentDto: AssignmentDto;

    beforeEach(async () => {
      assigneeUser = modelFaker.user();
      await userRepository.persist(assigneeUser);
      assignmentDto = new AssignmentDto(assigneeUser.id);
      jest.spyOn(roleDomain, 'assignUser');
      jest.spyOn(roleDomain, 'assignUserByEmailAndCreateIfNotExists');
    });

    test('happy path', async () => {
      await roleApplication.assignUser(ownerUser, roles[0].id, assignmentDto);
      expect(roleDomain.assignUser).toHaveBeenCalledWith(
        project,
        roles[0],
        assigneeUser,
        roles,
      );
    });

    test('happy path, by email', async () => {
      assignmentDto = new AssignmentDto(undefined, assigneeUser.email);
      await roleApplication.assignUser(ownerUser, roles[0].id, assignmentDto);
      expect(
        roleDomain.assignUserByEmailAndCreateIfNotExists,
      ).toHaveBeenCalledWith(project, roles[0], assigneeUser.email, roles);
    });

    test('should fail if authenticated user is not project owner', async () => {
      project.creatorId = primitiveFaker.id();
      await expect(
        roleApplication.assignUser(ownerUser, roles[0].id, assignmentDto),
      ).rejects.toThrow();
    });
  });
});
