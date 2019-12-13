import { Test } from '@nestjs/testing';
import { RoleService } from './role.service';
import {
  ConfigService,
  TokenService,
  RandomService,
  EmailService,
} from 'common';
import { UserEntity, UserRepository } from 'user';
import { ProjectEntity, ProjectState, ProjectRepository } from 'project';
import { RoleEntity } from 'role/entities/role.entity';
import { PeerReviewEntity } from 'role/entities/peer-review.entity';
import { RoleDtoBuilder } from 'role/dto/role.dto';
import { RoleRepository } from '../repositories/role.repository';
import { entityFaker, primitiveFaker } from '../../test';
import { GetRolesQueryDto } from '../dto/get-roles-query.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignmentDto } from '../dto/assignment.dto';
import { PeerReviewDto, PeerReviewDtoBuilder } from 'role/dto/peer-review.dto';

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
      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);
      jest.spyOn(project, 'getRoles').mockResolvedValue([role1, role2]);
    });

    test('happy path', async () => {
      const actualRoleDtos = await roleService.getRoles(owner, query);
      const expectedRoleDtos = [
        await new RoleDtoBuilder(role1, project, [role1, role2], owner).build(),
        await new RoleDtoBuilder(role2, project, [role1, role2], owner).build(),
      ];
      expect(actualRoleDtos).toEqual(expectedRoleDtos);
    });
  });

  describe('get role', () => {
    let sentPeerReview: PeerReviewEntity;
    let receivedPeerReview: PeerReviewEntity;

    beforeEach(() => {
      sentPeerReview = entityFaker.peerReview(role1.id, role2.id);
      receivedPeerReview = entityFaker.peerReview(role2.id, role1.id);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role1);
      jest.spyOn(role1, 'getProject').mockResolvedValue(project);
      jest.spyOn(project, 'getRoles').mockResolvedValue([role1, role2]);
      jest
        .spyOn(role1, 'getSentPeerReviews')
        .mockResolvedValue([sentPeerReview]);
      jest
        .spyOn(role1, 'getReceivedPeerReviews')
        .mockResolvedValue([receivedPeerReview]);
    });

    test('happy path', async () => {
      const actualRoleDto = await roleService.getRole(owner, role1.id);
      const expectedRoleDto = await new RoleDtoBuilder(
        role1,
        project,
        [role1, role2],
        owner,
      )
        .addSentPeerReviews(async () => [sentPeerReview])
        .addReceivedPeerReviews(async () => [receivedPeerReview])
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
      jest.spyOn(roleRepository, 'insert').mockResolvedValue();
      jest.spyOn(project, 'getRoles').mockResolvedValue([role1, role2]);
    });

    test('happy path', async () => {
      await roleService.createRole(owner, body);
      expect(roleRepository.insert).toHaveBeenCalledWith(
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
      user = entityFaker.user();
      project = entityFaker.project(user.id);
      role = entityFaker.role(project.id);
      dto = UpdateRoleDto.from({
        title: primitiveFaker.words(),
      });
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role);
      jest.spyOn(role, 'getProject').mockResolvedValue(project);
      jest.spyOn(project, 'getRoles').mockResolvedValue([role1, role2]);
      jest.spyOn(roleRepository, 'update').mockResolvedValue();
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
      expect(roleRepository.update).toHaveBeenCalledWith(
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
      jest.spyOn(role1, 'getProject').mockResolvedValue(project);
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
      assignee = entityFaker.user();
      dto = AssignmentDto.from({ assigneeId: assignee.id });
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role1);
      jest.spyOn(role1, 'getProject').mockResolvedValue(project);
      jest.spyOn(userRepository, 'exists').mockResolvedValue(true);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(assignee);
      jest.spyOn(project, 'getRoles').mockResolvedValue([role1, role2]);
      jest.spyOn(roleRepository, 'update').mockResolvedValue();
      jest
        .spyOn(emailService, 'sendUnregisteredUserNewAssignmentEmail')
        .mockResolvedValue();
    });

    test('happy path', async () => {
      await roleService.assignUser(owner, role1.id, dto);
      expect(roleRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ id: role1.id }),
      );
      expect(roleRepository.update).toHaveBeenCalledWith(
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
      expect(roleRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ assigneeId: assignee.id }),
      );
    });

    test('happy path, email of non-existing user', async () => {
      const assigneeEmail = primitiveFaker.email();
      dto = AssignmentDto.from({ assigneeEmail });
      jest.spyOn(userRepository, 'exists').mockResolvedValue(false);
      jest.spyOn(userRepository, 'insert').mockResolvedValue();
      await roleService.assignUser(owner, role1.id, dto);
      expect(roleRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ id: role1.id }),
      );
      expect(userRepository.exists).toHaveBeenCalledWith(
        expect.objectContaining({ email: assigneeEmail }),
      );
      expect(userRepository.insert).toHaveBeenCalledWith(
        expect.objectContaining({ email: assigneeEmail }),
      );
      expect(roleRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ assigneeId: expect.any(String) }),
      );
      expect(
        emailService.sendUnregisteredUserNewAssignmentEmail,
      ).toHaveBeenCalledWith(assigneeEmail);
    });

    test('project owner assignment is allowed', async () => {
      dto.assigneeId = owner.id;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(owner);
      await roleService.assignUser(owner, role1.id, dto);
      expect(roleRepository.update).toHaveBeenCalledWith(
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
      const role2 = entityFaker.role(project.id, assignee.id);
      jest.spyOn(project, 'getRoles').mockResolvedValue([role1, role2]);
      await expect(
        roleService.assignUser(owner, role1.id, dto),
      ).rejects.toThrow();
    });
  });
});
