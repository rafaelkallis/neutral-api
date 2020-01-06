import { Test } from '@nestjs/testing';
import { RoleService } from './role.service';
import { TokenService, RandomService } from 'common';
import { UserEntity, UserRepository, USER_REPOSITORY } from 'user';
import {
  ProjectEntity,
  ProjectState,
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project';
import { RoleEntity } from 'role/entities/role.entity';
import { PeerReviewEntity } from 'role/entities/peer-review.entity';
import { RoleDtoBuilder } from 'role/dto/role.dto';
import {
  RoleRepository,
  ROLE_REPOSITORY,
} from 'role/repositories/role.repository';
import {
  PeerReviewRepository,
  PEER_REVIEW_REPOSITORY,
} from 'role/repositories/peer-review.repository';
import { EntityFaker, PrimitiveFaker } from 'test';
import { TestModule } from 'test/test.module';
import { GetRolesQueryDto } from '../dto/get-roles-query.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignmentDto } from '../dto/assignment.dto';
import { TypeOrmRoleRepository } from 'role/repositories/typeorm-role.repository';
import { TypeOrmUserRepository } from 'user/repositories/typeorm-user.repository';
import { TypeOrmProjectRepository } from 'project/repositories/typeorm-project.repository';
import { TypeOrmPeerReviewRepository } from 'role/repositories/typeorm-peer-review.repository';
import { MockEmailSender, EMAIL_SENDER } from 'email';
import { MemoryUserRepository } from 'user/repositories/memory-user.repository';

describe('role service', () => {
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;
  let roleService: RoleService;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let peerReviewRepository: PeerReviewRepository;
  let emailSender: MockEmailSender;
  let owner: UserEntity;
  let project: ProjectEntity;
  let role1: RoleEntity;
  let role2: RoleEntity;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TestModule],
      providers: [
        RoleService,
        RandomService,
        TypeOrmRoleRepository,
        TypeOrmProjectRepository,
        TypeOrmPeerReviewRepository,
        TokenService,
        {
          provide: USER_REPOSITORY,
          useClass: MemoryUserRepository,
        },
        {
          provide: EMAIL_SENDER,
          useClass: MockEmailSender,
        },
      ],
    }).compile();

    entityFaker = module.get(EntityFaker);
    primitiveFaker = module.get(PrimitiveFaker);
    roleService = module.get(RoleService);
    userRepository = module.get(USER_REPOSITORY);
    projectRepository = module.get(PROJECT_REPOSITORY);
    roleRepository = module.get(ROLE_REPOSITORY);
    peerReviewRepository = module.get(PEER_REVIEW_REPOSITORY);
    emailSender = module.get(EMAIL_SENDER);
    owner = entityFaker.user();
    project = entityFaker.project(owner.id);
    role1 = entityFaker.role(project.id);
    role2 = entityFaker.role(project.id);
  });

  test('should be defined', () => {
    expect(roleService).toBeDefined();
  });

  describe('get roles', () => {
    let query: GetRolesQueryDto;

    beforeEach(() => {
      query = GetRolesQueryDto.from({ projectId: project.id });
      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);
      jest
        .spyOn(roleRepository, 'findByProjectId')
        .mockResolvedValue([role1, role2]);
    });

    test('happy path', async () => {
      const actualRoleDtos = await roleService.getRoles(owner, query);
      const expectedRoleDtos = [
        await RoleDtoBuilder.of(role1)
          .withProject(project)
          .withProjectRoles([role1, role2])
          .withAuthUser(owner)
          .build(),
        await RoleDtoBuilder.of(role2)
          .withProject(project)
          .withProjectRoles([role1, role2])
          .withAuthUser(owner)
          .build(),
      ];
      expect(actualRoleDtos).toEqual(expectedRoleDtos);
    });
  });

  describe('get role', () => {
    let sentPeerReview: PeerReviewEntity;

    beforeEach(() => {
      sentPeerReview = peerReviewRepository.createEntity(
        entityFaker.peerReview(role1.id, role2.id),
      );
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role1);
      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);
      jest
        .spyOn(roleRepository, 'findByProjectId')
        .mockResolvedValue([role1, role2]);
      jest
        .spyOn(peerReviewRepository, 'findBySenderRoleId')
        .mockResolvedValue([sentPeerReview]);
    });

    test('happy path', async () => {
      const actualRoleDto = await roleService.getRole(owner, role1.id);
      const expectedRoleDto = await RoleDtoBuilder.of(role1)
        .withProject(project)
        .withProjectRoles([role1, role2])
        .withAuthUser(owner)
        .addSentPeerReviews(async () => [sentPeerReview])
        .build();
      expect(actualRoleDto).toEqual(expectedRoleDto);
    });
  });

  describe('create role', () => {
    let body: CreateRoleDto;

    beforeEach(() => {
      body = CreateRoleDto.from({
        projectId: project.id,
        title: primitiveFaker.words(),
        description: primitiveFaker.paragraph(),
      });
      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);
      jest.spyOn(roleRepository, 'persist').mockResolvedValue();
      jest
        .spyOn(roleRepository, 'findByProjectId')
        .mockResolvedValue([role1, role2]);
    });

    test('happy path', async () => {
      await roleService.createRole(owner, body);
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: body.projectId,
          assigneeId: null,
          title: body.title,
          description: body.description,
        }),
      );
    });

    test('should fail when project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await expect(roleService.createRole(owner, body)).rejects.toThrow();
    });
  });

  describe('update role', () => {
    let user: UserEntity;
    let project: ProjectEntity;
    let role: RoleEntity;
    let dto: UpdateRoleDto;

    beforeEach(() => {
      user = userRepository.createEntity(entityFaker.user());
      project = projectRepository.createEntity(entityFaker.project(user.id));
      role = roleRepository.createEntity(entityFaker.role(project.id));
      dto = UpdateRoleDto.from({
        title: primitiveFaker.words(),
      });
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role);
      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);
      jest
        .spyOn(roleRepository, 'findByProjectId')
        .mockResolvedValue([role1, role2]);
      jest.spyOn(roleRepository, 'persist').mockResolvedValue();
    });

    test('happy path', async () => {
      const actualRoleDto = await roleService.updateRole(user, role.id, dto);
      expect(actualRoleDto).toEqual(
        expect.objectContaining({
          title: dto.title,
        }),
      );
      expect(roleRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ id: role.id }),
      );
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({
          title: dto.title,
        }),
      );
    });

    test('should fail if authenticated user is not project owner', async () => {
      project.ownerId = primitiveFaker.id();
      await expect(
        roleService.updateRole(user, role.id, dto),
      ).rejects.toThrow();
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await expect(
        roleService.updateRole(user, role.id, dto),
      ).rejects.toThrow();
    });
  });

  describe('delete role', () => {
    beforeEach(async () => {
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role1);
      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);
      jest.spyOn(roleRepository, 'delete').mockResolvedValue();
    });

    test('happy path', async () => {
      await roleService.deleteRole(owner, role1.id);
      expect(roleRepository.delete).toHaveBeenCalledWith(role1);
    });
  });

  describe('assign user', () => {
    let assignee: UserEntity;
    let dto: AssignmentDto;

    beforeEach(() => {
      assignee = userRepository.createEntity(entityFaker.user());
      dto = AssignmentDto.from({ assigneeId: assignee.id });
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role1);
      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);
      jest.spyOn(userRepository, 'exists').mockResolvedValue(true);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(assignee);
      jest
        .spyOn(roleRepository, 'findByProjectId')
        .mockResolvedValue([role1, role2]);
      jest.spyOn(roleRepository, 'persist').mockResolvedValue();
      jest
        .spyOn(emailSender, 'sendUnregisteredUserNewAssignmentEmail')
        .mockResolvedValue();
    });

    test('happy path', async () => {
      await roleService.assignUser(owner, role1.id, dto);
      expect(roleRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ id: role1.id }),
      );
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({ assigneeId: assignee.id }),
      );
    });

    test('happy path, email of existing user', async () => {
      dto = AssignmentDto.from({ assigneeEmail: assignee.email });
      await roleService.assignUser(owner, role1.id, dto);
      expect(roleRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ id: role1.id }),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ email: assignee.email }),
      );
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({ assigneeId: assignee.id }),
      );
    });

    test('happy path, email of non-existing user', async () => {
      const assigneeEmail = primitiveFaker.email();
      dto = AssignmentDto.from({ assigneeEmail });
      jest.spyOn(userRepository, 'exists').mockResolvedValue(false);
      jest.spyOn(userRepository, 'persist').mockResolvedValue();
      await roleService.assignUser(owner, role1.id, dto);
      expect(roleRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ id: role1.id }),
      );
      expect(userRepository.existsByEmail).toHaveBeenCalledWith(assigneeEmail);
      expect(userRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({ email: assigneeEmail }),
      );
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({ assigneeId: expect.any(String) }),
      );
      expect(
        emailSender.sendUnregisteredUserNewAssignmentEmail,
      ).toHaveBeenCalledWith(assigneeEmail);
    });

    test('project owner assignment is allowed', async () => {
      dto.assigneeId = owner.id;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(owner);
      await roleService.assignUser(owner, role1.id, dto);
      expect(roleRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({ assigneeId: owner.id }),
      );
    });

    test('should fail if authenticated user is not project owner', async () => {
      project.ownerId = primitiveFaker.id();
      await expect(
        roleService.assignUser(owner, role1.id, dto),
      ).rejects.toThrow();
    });

    test('should fail if project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await expect(
        roleService.assignUser(owner, role1.id, dto),
      ).rejects.toThrow();
    });

    test('should fail if user already assigned to another role in same project', async () => {
      const role2 = roleRepository.createEntity(
        entityFaker.role(project.id, assignee.id),
      );
      jest
        .spyOn(roleRepository, 'findByProjectId')
        .mockResolvedValue([role1, role2]);
      await expect(
        roleService.assignUser(owner, role1.id, dto),
      ).rejects.toThrow();
    });
  });
});
