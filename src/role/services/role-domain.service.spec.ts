import { UserEntity, UserRepository, FakeUserRepository } from 'user';
import {
  ProjectEntity,
  ProjectState,
  ProjectRepository,
  FakeProjectRepository,
} from 'project';
import { RoleEntity } from 'role/entities/role.entity';
import { RoleRepository } from 'role/repositories/role.repository';
import { EntityFaker, PrimitiveFaker } from 'test';
import { FakeRoleRepository } from 'role/repositories/fake-role.repository';
import { MockEventPublisherService } from 'event';
import { RoleDomainService } from 'role/services/role-domain.service';
import { MockEmailService } from 'email';

describe('role domain service', () => {
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;

  let eventPublisher: MockEventPublisherService;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let emailService: MockEmailService;

  let roleDomain: RoleDomainService;

  let ownerUser: UserEntity;
  let project: ProjectEntity;
  let roles: RoleEntity[];

  beforeEach(async () => {
    entityFaker = new EntityFaker();
    primitiveFaker = new PrimitiveFaker();

    eventPublisher = new MockEventPublisherService();
    userRepository = new FakeUserRepository();
    projectRepository = new FakeProjectRepository();
    roleRepository = new FakeRoleRepository();
    emailService = new MockEmailService();

    roleDomain = new RoleDomainService(
      eventPublisher,
      userRepository,
      roleRepository,
      emailService,
    );
    ownerUser = entityFaker.user();
    await userRepository.persist(ownerUser);
    project = entityFaker.project(ownerUser.id);
    await projectRepository.persist(project);
    roles = [entityFaker.role(project.id), entityFaker.role(project.id)];
    await roleRepository.persist(...roles);
  });

  test('should be defined', () => {
    expect(roleDomain).toBeDefined();
  });

  describe('create role', () => {
    let title: string;
    let description: string;

    beforeEach(() => {
      title = primitiveFaker.words();
      description = primitiveFaker.paragraph();
      jest.spyOn(roleRepository, 'persist');
    });

    test('happy path', async () => {
      await roleDomain.createRole({ title, description }, project);
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: project.id,
          assigneeId: null,
          title,
          description,
        }),
      );
    });

    test('should fail when project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      await expect(
        roleDomain.createRole({ title, description }, project),
      ).rejects.toThrow();
    });
  });

  describe('update role', () => {
    let title: string;

    beforeEach(() => {
      title = primitiveFaker.words();
      jest.spyOn(roleRepository, 'persist');
    });

    test('happy path', async () => {
      await roleDomain.updateRole(project, roles[0], { title });
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          id: roles[0].id,
          title,
        }),
      );
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      await expect(
        roleDomain.updateRole(project, roles[0], { title }),
      ).rejects.toThrow();
    });
  });

  describe('delete role', () => {
    beforeEach(() => {
      jest.spyOn(roleRepository, 'delete');
    });

    test('happy path', async () => {
      await roleDomain.deleteRole(project, roles[0]);
      expect(roleRepository.delete).toHaveBeenCalledWith(roles[0]);
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      await expect(roleDomain.deleteRole(project, roles[0])).rejects.toThrow();
    });
  });

  describe('assign user', () => {
    let assigneeUser: UserEntity;

    beforeEach(async () => {
      assigneeUser = entityFaker.user();
      await userRepository.persist(assigneeUser);
      jest.spyOn(roleRepository, 'persist');
      jest.spyOn(emailService, 'sendUnregisteredUserNewAssignmentEmail');
    });

    test('happy path', async () => {
      await roleDomain.assignUser(project, roles[0], assigneeUser, roles);
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          id: roles[0].id,
          assigneeId: assigneeUser.id,
        }),
      );
    });

    test('project owner assignment is allowed', async () => {
      await roleDomain.assignUser(project, roles[0], ownerUser, roles);
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({ assigneeId: ownerUser.id }),
      );
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      await expect(
        roleDomain.assignUser(project, roles[0], assigneeUser, roles),
      ).rejects.toThrow();
    });

    test('should fail if user already assigned to another role in same project', async () => {
      const role3 = entityFaker.role(project.id, assigneeUser.id);
      await roleRepository.persist(role3);
      roles.push(role3);
      await expect(
        roleDomain.assignUser(project, roles[0], assigneeUser, roles),
      ).rejects.toThrow();
    });
  });

  describe('assign user by email', () => {
    let assigneeUser: UserEntity;

    beforeEach(async () => {
      assigneeUser = entityFaker.user();
      await userRepository.persist(assigneeUser);
      jest.spyOn(userRepository, 'persist');
      jest.spyOn(roleRepository, 'persist');
      jest.spyOn(roleDomain, 'assignUser');
      jest.spyOn(emailService, 'sendUnregisteredUserNewAssignmentEmail');
    });

    test('happy path, existing user', async () => {
      await roleDomain.assignUserByEmailAndCreateIfNotExists(
        project,
        roles[0],
        assigneeUser.email,
        roles,
      );
      expect(roleDomain.assignUser).toHaveBeenCalledWith(
        project,
        roles[0],
        assigneeUser,
        roles,
      );
    });

    test('happy path, non-existing user', async () => {
      const assigneeEmail = primitiveFaker.email();
      await roleDomain.assignUserByEmailAndCreateIfNotExists(
        project,
        roles[0],
        assigneeEmail,
        roles,
      );
      expect(userRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({ email: assigneeEmail }),
      );
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          id: roles[0].id,
          assigneeId: expect.any(String),
        }),
      );
      expect(
        emailService.sendUnregisteredUserNewAssignmentEmail,
      ).toHaveBeenCalledWith(assigneeEmail);
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await projectRepository.persist(project);
      await expect(
        roleDomain.assignUserByEmailAndCreateIfNotExists(
          project,
          roles[0],
          assigneeUser.email,
          roles,
        ),
      ).rejects.toThrow();
    });
  });
});
