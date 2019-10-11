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
  Contributions,
  PeerReviews,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';
import { RoleDto, RoleDtoBuilder } from './dto/role.dto';
import { GetRolesQueryDto } from './dto/get-roles-query.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SubmitPeerReviewsDto } from './dto/submit-peer-reviews.dto';

describe('role service', () => {
  let roleService: RoleService;
  let contributionsModelService: ContributionsModelService;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let user: UserEntity;
  let project: ProjectEntity;
  let role: RoleEntity;
  let roleDto: RoleDto;

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
      ],
    }).compile();

    roleService = module.get(RoleService);
    contributionsModelService = module.get(ContributionsModelService);
    projectRepository = module.get(ProjectRepository);
    roleRepository = module.get(RoleRepository);
    user = entityFaker.user();
    project = entityFaker.project(user.id);
    role = entityFaker.role(project.id);
    roleDto = new RoleDtoBuilder(role).exposePeerReviews().build();
  });

  test('should be defined', () => {
    expect(roleService).toBeDefined();
  });

  describe('get roles', () => {
    let query: GetRolesQueryDto;

    beforeEach(() => {
      query = GetRolesQueryDto.from({ projectId: project.id });
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(roleRepository, 'find').mockResolvedValue([role]);
    });

    test('happy path', async () => {
      await expect(roleService.getRoles(user, query)).resolves.toContainEqual(
        role,
      );
    });
  });

  describe('get role', () => {
    beforeEach(() => {
      jest.spyOn(roleRepository, 'findOneOrFail').mockResolvedValue(role);
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
    });

    test('happy path', async () => {
      await expect(roleService.getRole(user, role.id)).resolves.toEqual(role);
    });

    test('should not expose peer reviews if not project owner or assignee', async () => {
      const otherUser = entityFaker.user();
      await expect(roleService.getRole(otherUser, role.id)).resolves.toEqual(
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
      jest.spyOn(roleRepository, 'save').mockResolvedValue(role);
    });

    test('happy path', async () => {
      await expect(roleService.createRole(user, body)).resolves.toEqual(
        roleDto,
      );
    });

    test('should fail when project is not in formation state', async () => {
      project.state = ProjectState.PEER_REVIEW;
      await expect(roleService.createRole(user, body)).rejects.toThrow();
    });
  });

  describe('update role', () => {
    let user: UserEntity;
    let project: ProjectEntity;
    let role: RoleEntity;
    let dto: UpdateRoleDto;

    beforeEach(async () => {
      user = entityFaker.user();
      project = entityFaker.project(user.id);
      role = entityFaker.role(project.id);
      const title = primitiveFaker.words();
      dto = UpdateRoleDto.from({ title });
      jest.spyOn(roleRepository, 'findOneOrFail').mockResolvedValue(role);
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(roleRepository, 'save').mockResolvedValue(role);
    });

    test('happy path', async () => {
      await roleService.updateRole(user, role.id, dto);
      expect(roleRepository.findOneOrFail).toHaveBeenCalledWith(
        expect.objectContaining({ id: role.id }),
      );
      expect(roleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: dto.title }),
      );
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

  describe('submit peer reviews', () => {
    let user: UserEntity;
    let project: ProjectEntity;
    let role2: RoleEntity;
    let role3: RoleEntity;
    let role4: RoleEntity;
    let peerReviews: PeerReviews;
    let contributions: Contributions;
    let dto: SubmitPeerReviewsDto;

    beforeEach(async () => {
      user = entityFaker.user();
      project = entityFaker.project(user.id);
      project.state = ProjectState.PEER_REVIEW;
      role.assigneeId = user.id;
      role.peerReviews = null;
      role2 = entityFaker.role(project.id);
      role2.peerReviews = {};
      role3 = entityFaker.role(project.id);
      role3.peerReviews = {};
      role4 = entityFaker.role(project.id);
      role4.peerReviews = {};

      peerReviews = {
        [role.id]: 0,
        [role2.id]: 0.3,
        [role3.id]: 0.2,
        [role4.id]: 0.5,
      };
      dto = SubmitPeerReviewsDto.from({ peerReviews });
      contributions = {};
      jest
        .spyOn(contributionsModelService, 'computeContributions')
        .mockReturnValue(contributions);
      jest.spyOn(roleRepository, 'findOneOrFail').mockResolvedValue(role);
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest
        .spyOn(roleRepository, 'find')
        .mockResolvedValue([role2, role3, role4]);
      jest.spyOn(roleRepository, 'save').mockResolvedValue(role);
      jest.spyOn(projectRepository, 'save').mockResolvedValue(project);
    });

    test('happy path', async () => {
      await expect(
        roleService.submitPeerReviews(user, role.id, dto),
      ).resolves.not.toThrow();
      expect(
        contributionsModelService.computeContributions,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          [role.id]: peerReviews,
          [role2.id]: role2.peerReviews,
          [role3.id]: role3.peerReviews,
          [role4.id]: role4.peerReviews,
        }),
      );
      expect(project.state).toBe(ProjectState.FINISHED);
      expect(roleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ peerReviews }),
      );
      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ contributions }),
      );
    });

    test('should fail if project is not in peer-review state', async () => {
      project.state = ProjectState.FORMATION;
      await expect(
        roleService.submitPeerReviews(user, role.id, dto),
      ).rejects.toThrow();
    });

    test('should fail if peer reviews have been previously submitted', async () => {
      role.peerReviews = peerReviews;
      await expect(
        roleService.submitPeerReviews(user, role.id, dto),
      ).rejects.toThrow();
    });

    test('should fail if a peer review is for non-existing peer', async () => {
      role.peerReviews = peerReviews;
      delete role.peerReviews[role2.id];
      role.peerReviews[primitiveFaker.id()] = 0.3;
      await expect(
        roleService.submitPeerReviews(user, role.id, dto),
      ).rejects.toThrow();
    });
  });
});
