import { RoleService } from './role.service';
import { UserEntity, UserRepository, FakeUserRepository } from 'user';
import {
  ProjectEntity,
  ProjectState,
  ProjectRepository,
  FakeProjectRepository,
} from 'project';
import { RoleEntity } from 'role/entities/role.entity';
import { PeerReviewEntity } from 'role/entities/peer-review.entity';
import { RoleDtoBuilder } from 'role/dto/role.dto';
import { RoleRepository } from 'role/repositories/role.repository';
import { PeerReviewRepository } from 'role/repositories/peer-review.repository';
import { EntityFaker, PrimitiveFaker } from 'test';
import { GetRolesQueryDto } from 'role/dto/get-roles-query.dto';
import { CreateRoleDto } from 'role/dto/create-role.dto';
import { UpdateRoleDto } from 'role/dto/update-role.dto';
import { AssignmentDto } from 'role/dto/assignment.dto';
import { MockEmailSender } from 'email';
import { FakeRoleRepository } from 'role/repositories/fake-role.repository';
import { FakePeerReviewRepository } from 'role/repositories/fake-peer-review.repository';

describe('role service', () => {
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;

  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let peerReviewRepository: PeerReviewRepository;
  let emailSender: MockEmailSender;

  let roleService: RoleService;

  let ownerUser: UserEntity;
  let project: ProjectEntity;
  let role1: RoleEntity;
  let role2: RoleEntity;

  beforeEach(async () => {
    entityFaker = new EntityFaker();
    primitiveFaker = new PrimitiveFaker();

    userRepository = new FakeUserRepository();
    projectRepository = new FakeProjectRepository();
    roleRepository = new FakeRoleRepository();
    peerReviewRepository = new FakePeerReviewRepository();
    emailSender = new MockEmailSender();

    roleService = new RoleService(
      userRepository,
      projectRepository,
      roleRepository,
      peerReviewRepository,
      emailSender,
    );
    ownerUser = entityFaker.user();
    await userRepository.persist(ownerUser);
    project = entityFaker.project(ownerUser.id);
    await projectRepository.persist(project);
    role1 = entityFaker.role(project.id);
    role2 = entityFaker.role(project.id);
    await roleRepository.persist(role1, role2);
  });

  test('should be defined', () => {
    expect(roleService).toBeDefined();
  });

  describe('get roles', () => {
    let getRolesQueryDto: GetRolesQueryDto;

    beforeEach(() => {
      getRolesQueryDto = GetRolesQueryDto.from({ projectId: project.id });
    });

    test('happy path', async () => {
      const actualRoleDtos = await roleService.getRoles(
        ownerUser,
        getRolesQueryDto,
      );
      const expectedRoleDtos = [
        await RoleDtoBuilder.of(role1)
          .withProject(project)
          .withProjectRoles([role1, role2])
          .withAuthUser(ownerUser)
          .build(),
        await RoleDtoBuilder.of(role2)
          .withProject(project)
          .withProjectRoles([role1, role2])
          .withAuthUser(ownerUser)
          .build(),
      ];
      expect(actualRoleDtos).toEqual(expectedRoleDtos);
    });
  });

  describe('get role', () => {
    let sentPeerReview: PeerReviewEntity;

    beforeEach(async () => {
      sentPeerReview = entityFaker.peerReview(role1.id, role2.id);
      await peerReviewRepository.persist(sentPeerReview);
    });

    test('happy path', async () => {
      const actualRoleDto = await roleService.getRole(ownerUser, role1.id);
      const expectedRoleDto = await RoleDtoBuilder.of(role1)
        .withProject(project)
        .withProjectRoles([role1, role2])
        .withAuthUser(ownerUser)
        .addSentPeerReviews(async () => [sentPeerReview])
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
      createRoleDto = CreateRoleDto.from({
        projectId: project.id,
        title,
        description,
      });
      jest.spyOn(roleRepository, 'persist');
    });

    test('happy path', async () => {
      await roleService.createRole(ownerUser, createRoleDto);
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: createRoleDto.projectId,
          assigneeId: null,
          title: createRoleDto.title,
          description: createRoleDto.description,
        }),
      );
    });

    test('should fail when project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      await expect(
        roleService.createRole(ownerUser, createRoleDto),
      ).rejects.toThrow();
    });
  });

  describe('update role', () => {
    let updateRoleDto: UpdateRoleDto;

    beforeEach(() => {
      updateRoleDto = UpdateRoleDto.from({
        title: primitiveFaker.words(),
      });
      jest.spyOn(roleRepository, 'persist');
    });

    test('happy path', async () => {
      const actualRoleDto = await roleService.updateRole(
        ownerUser,
        role1.id,
        updateRoleDto,
      );
      expect(actualRoleDto).toEqual(
        expect.objectContaining({
          title: updateRoleDto.title,
        }),
      );
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          id: role1.id,
          title: updateRoleDto.title,
        }),
      );
    });

    test('should fail if authenticated user is not project owner', async () => {
      const nonOwnerUser = entityFaker.user();
      await userRepository.persist(nonOwnerUser);
      await expect(
        roleService.updateRole(nonOwnerUser, role1.id, updateRoleDto),
      ).rejects.toThrow();
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      await expect(
        roleService.updateRole(ownerUser, role1.id, updateRoleDto),
      ).rejects.toThrow();
    });
  });

  describe('delete role', () => {
    beforeEach(() => {
      jest.spyOn(roleRepository, 'delete');
    });

    test('happy path', async () => {
      await roleService.deleteRole(ownerUser, role1.id);
      expect(roleRepository.delete).toHaveBeenCalledWith(role1);
    });
  });

  describe('assign user', () => {
    let assigneeUser: UserEntity;
    let assignmentDto: AssignmentDto;

    beforeEach(async () => {
      assigneeUser = entityFaker.user();
      await userRepository.persist(assigneeUser);
      assignmentDto = AssignmentDto.from({ assigneeId: assigneeUser.id });
      jest.spyOn(userRepository, 'persist');
      jest.spyOn(roleRepository, 'persist');
      jest.spyOn(emailSender, 'sendUnregisteredUserNewAssignmentEmail');
    });

    test('happy path', async () => {
      await roleService.assignUser(ownerUser, role1.id, assignmentDto);
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          id: role1.id,
          assigneeId: assigneeUser.id,
        }),
      );
    });

    test('happy path, email of existing user', async () => {
      assignmentDto = AssignmentDto.from({ assigneeEmail: assigneeUser.email });
      await roleService.assignUser(ownerUser, role1.id, assignmentDto);
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          id: role1.id,
          assigneeId: assigneeUser.id,
        }),
      );
    });

    test('happy path, email of non-existing user', async () => {
      const assigneeEmail = primitiveFaker.email();
      assignmentDto = AssignmentDto.from({ assigneeEmail });
      jest.spyOn(userRepository, 'existsByEmail').mockResolvedValue(false);
      jest.spyOn(userRepository, 'persist').mockResolvedValue();
      await roleService.assignUser(ownerUser, role1.id, assignmentDto);
      expect(userRepository.existsByEmail).toHaveBeenCalledWith(assigneeEmail);
      expect(userRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({ email: assigneeEmail }),
      );
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          id: role1.id,
          assigneeId: expect.any(String),
        }),
      );
      expect(
        emailSender.sendUnregisteredUserNewAssignmentEmail,
      ).toHaveBeenCalledWith(assigneeEmail);
    });

    test('project owner assignment is allowed', async () => {
      assignmentDto.assigneeId = ownerUser.id;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(ownerUser);
      await roleService.assignUser(ownerUser, role1.id, assignmentDto);
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({ assigneeId: ownerUser.id }),
      );
    });

    test('should fail if authenticated user is not project owner', async () => {
      project.ownerId = primitiveFaker.id();
      await expect(
        roleService.assignUser(ownerUser, role1.id, assignmentDto),
      ).rejects.toThrow();
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await expect(
        roleService.assignUser(ownerUser, role1.id, assignmentDto),
      ).rejects.toThrow();
    });

    test('should fail if user already assigned to another role in same project', async () => {
      const role2 = entityFaker.role(project.id, assigneeUser.id);
      jest
        .spyOn(roleRepository, 'findByProjectId')
        .mockResolvedValue([role1, role2]);
      await expect(
        roleService.assignUser(ownerUser, role1.id, assignmentDto),
      ).rejects.toThrow();
    });
  });
});
