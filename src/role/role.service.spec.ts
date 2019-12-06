import { Test } from '@nestjs/testing';
import { RoleService } from './role.service';
import {
  ConfigService,
  TokenService,
  RandomService,
  UserRepository,
  UserEntity,
  ProjectEntity,
  ProjectState,
  RoleEntity,
  ProjectRepository,
  RoleRepository,
  ContributionsModelService,
  EmailService,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';
import { GetRolesQueryDto } from './dto/get-roles-query.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignmentDto } from './dto/assignment.dto';

describe('role service', () => {
  let roleService: RoleService;
  let userRepository: UserRepository;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let emailService: EmailService;
  let owner: UserEntity;
  let project: ProjectEntity;
  let role1: RoleEntity;
  let role2: RoleEntity;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RoleService,
        RandomService,
        ConfigService,
        RoleRepository,
        UserRepository,
        ProjectRepository,
        TokenService,
        ContributionsModelService,
        EmailService,
      ],
    }).compile();

    roleService = module.get(RoleService);
    userRepository = module.get(UserRepository);
    projectRepository = module.get(ProjectRepository);
    roleRepository = module.get(RoleRepository);
    emailService = module.get(EmailService);
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
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(roleRepository, 'find').mockResolvedValue([role1, role2]);
    });

    test('happy path', async () => {
      await expect(roleService.getRoles(owner, query)).resolves.toContainEqual(
        role1,
      );
      await expect(roleService.getRoles(owner, query)).resolves.toContainEqual(
        role2,
      );
    });

    test('should expose contribution if project owner', async () => {
      role1.contribution = 0.5;
      role2.contribution = 0.5;
      const rolesDto = await roleService.getRoles(owner, query);
      for (const roleDto of rolesDto) {
        expect(roleDto.contribution).toEqual(0.5);
      }
    });

    test('should expose contribution if role assignee', async () => {
      const assignee = entityFaker.user();
      role1.assigneeId = assignee.id;
      role1.contribution = 0.5;
      const rolesDto = await roleService.getRoles(assignee, query);
      for (const roleDto of rolesDto) {
        if (roleDto.id === role1.id) {
          expect(roleDto.contribution).toEqual(0.5);
        }
      }
    });

    test('should expose peer reviews if project owner', async () => {
      const peerReview = entityFaker.peerReview(role1, role2.id);
      role1.peerReviews.push(peerReview);
      const rolesDto = await roleService.getRoles(owner, query);
      for (const roleDto of rolesDto) {
        if (roleDto.id === role1.id) {
          expect(roleDto.peerReviews).toContainEqual([
            peerReview.revieweeRoleId,
            peerReview.score,
          ]);
        }
      }
    });

    test('should expose peer reviews if role assignee', async () => {
      const assignee = entityFaker.user();
      role1.assigneeId = assignee.id;
      const peerReview = entityFaker.peerReview(role1, role2.id);
      role1.peerReviews.push(peerReview);
      const rolesDto = await roleService.getRoles(assignee, query);
      for (const roleDto of rolesDto) {
        if (roleDto.id === role1.id) {
          expect(roleDto.peerReviews).toContainEqual([
            peerReview.revieweeRoleId,
            peerReview.score,
          ]);
        }
      }
    });

    test('should not expose contribution if not project owner or assignee', async () => {
      role1.contribution = 0.1;
      const otherUser = entityFaker.user();
      const rolesDto = await roleService.getRoles(otherUser, query);
      for (const roleDto of rolesDto) {
        expect(roleDto.contribution).toBeFalsy();
      }
    });

    test('should not expose peer reviews if not project owner or assignee', async () => {
      role1.peerReviews = [entityFaker.peerReview(role1, role2.id)];
      const otherUser = entityFaker.user();
      const rolesDto = await roleService.getRoles(otherUser, query);
      for (const roleDto of rolesDto) {
        expect(roleDto.peerReviews).toBeFalsy();
      }
    });
  });

  describe('get role', () => {
    beforeEach(() => {
      jest.spyOn(roleRepository, 'findOneOrFail').mockResolvedValue(role1);
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
    });

    test('happy path', async () => {
      await expect(roleService.getRole(owner, role1.id)).resolves.toEqual(
        role1,
      );
    });

    test('should expose contribution if project owner', async () => {
      role1.contribution = 0.5;
      const roleDto = await roleService.getRole(owner, role1.id);
      expect(roleDto.contribution).toEqual(0.5);
    });

    test('should expose contribution if role assignee', async () => {
      const assignee = entityFaker.user();
      role1.assigneeId = assignee.id;
      role1.contribution = 0.5;
      const roleDto = await roleService.getRole(assignee, role1.id);
      expect(roleDto.contribution).toEqual(0.5);
    });

    test('should expose peer reviews if project owner', async () => {
      const peerReview = entityFaker.peerReview(role1, role2.id);
      role1.peerReviews.push(peerReview);
      const roleDto = await roleService.getRole(owner, role1.id);
      expect(roleDto.peerReviews).toContainEqual([
        peerReview.revieweeRoleId,
        peerReview.score,
      ]);
    });

    test('should expose peer reviews if role assignee', async () => {
      const assignee = entityFaker.user();
      role1.assigneeId = assignee.id;
      const peerReview = entityFaker.peerReview(role1, role2.id);
      role1.peerReviews.push(peerReview);
      const roleDto = await roleService.getRole(assignee, role1.id);
      expect(roleDto.peerReviews).toContainEqual([
        peerReview.revieweeRoleId,
        peerReview.score,
      ]);
    });

    test('should not expose contribution if not project owner or assignee', async () => {
      role1.contribution = 0.1;
      const otherUser = entityFaker.user();
      await expect(roleService.getRole(otherUser, role1.id)).resolves.toEqual(
        expect.objectContaining({ contribution: null }),
      );
    });

    test('should not expose peer reviews if not project owner or assignee', async () => {
      const otherUser = entityFaker.user();
      await expect(roleService.getRole(otherUser, role1.id)).resolves.toEqual(
        expect.objectContaining({ peerReviews: null }),
      );
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
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(roleRepository, 'save').mockResolvedValue(role1);
    });

    test('happy path', async () => {
      await expect(roleService.createRole(owner, body)).resolves.toEqual(
        expect.objectContaining({
          id: expect.any(String),
          projectId: role1.projectId,
          assigneeId: null,
          title: role1.title,
          description: role1.description,
          contribution: null,
          peerReviews: [],
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
      user = entityFaker.user();
      project = entityFaker.project(user.id);
      role = entityFaker.role(project.id);
      dto = UpdateRoleDto.from({
        title: primitiveFaker.words(),
      });
      jest.spyOn(roleRepository, 'findOneOrFail').mockResolvedValue(role);
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(user);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(undefined);
      jest.spyOn(roleRepository, 'save').mockResolvedValue(role);
    });

    test('happy path', async () => {
      await roleService.updateRole(user, role.id, dto);
      expect(roleRepository.findOneOrFail).toHaveBeenCalledWith(
        expect.objectContaining({ id: role.id }),
      );
      expect(roleRepository.save).toHaveBeenCalledWith(
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
    let user: UserEntity;
    let project: ProjectEntity;
    let role: RoleEntity;

    beforeEach(async () => {
      user = entityFaker.user();
      project = entityFaker.project(user.id);
      role = entityFaker.role(project.id);
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(roleRepository, 'findOneOrFail').mockResolvedValue(role);
      jest.spyOn(roleRepository, 'remove').mockResolvedValue(role);
    });

    test('happy path', async () => {
      await roleService.deleteRole(user, role.id);
      expect(roleRepository.remove).toHaveBeenCalledWith(role);
    });
  });

  describe('assign user', () => {
    let assignee: UserEntity;
    let dto: AssignmentDto;

    beforeEach(() => {
      assignee = entityFaker.user();
      dto = AssignmentDto.from({ assigneeId: assignee.id });
      jest.spyOn(roleRepository, 'findOneOrFail').mockResolvedValue(role1);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(undefined);
      jest.spyOn(roleRepository, 'save').mockResolvedValue(role1);
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(assignee);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(assignee);
      jest.spyOn(userRepository, 'save').mockResolvedValue(assignee);
      jest
        .spyOn(emailService, 'sendUnregisteredUserNewAssignmentEmail')
        .mockResolvedValue(undefined);
    });

    test('happy path', async () => {
      await roleService.assignUser(owner, role1.id, dto);
      expect(roleRepository.findOneOrFail).toHaveBeenCalledWith(
        expect.objectContaining({ id: role1.id }),
      );
      expect(roleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ assigneeId: assignee.id }),
      );
    });

    test('happy path, email of existing user', async () => {
      dto = AssignmentDto.from({ assigneeEmail: assignee.email });
      await roleService.assignUser(owner, role1.id, dto);
      expect(roleRepository.findOneOrFail).toHaveBeenCalledWith(
        expect.objectContaining({ id: role1.id }),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ email: assignee.email }),
      );
      expect(roleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ assigneeId: assignee.id }),
      );
    });

    test('happy path, email of non-existing user', async () => {
      const assigneeEmail = primitiveFaker.email();
      dto = AssignmentDto.from({ assigneeEmail });
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      await roleService.assignUser(owner, role1.id, dto);
      expect(roleRepository.findOneOrFail).toHaveBeenCalledWith(
        expect.objectContaining({ id: role1.id }),
      );
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ email: assigneeEmail }),
      );
      expect(roleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ assigneeId: expect.any(String) }),
      );
      expect(
        emailService.sendUnregisteredUserNewAssignmentEmail,
      ).toHaveBeenCalledWith(assigneeEmail);
    });

    test('project owner assignment is allowed', async () => {
      dto.assigneeId = owner.id;
      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(owner);
      await roleService.assignUser(owner, role1.id, dto);
      expect(roleRepository.save).toHaveBeenCalledWith(
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
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role1);
      await expect(
        roleService.assignUser(owner, role1.id, dto),
      ).rejects.toThrow();
    });
  });
});
