import { Test } from '@nestjs/testing';
import { RoleService } from './role.service';
import {
  ConfigService,
  TokenService,
  RandomService,
  UserRepository,
  User,
  Project,
  Role,
  ProjectRepository,
  RoleRepository,
} from '../common';
import { entityFaker, primitiveFaker } from '../test';
import { GetRolesQueryDto } from './dto/get-roles-query.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SubmitPeerReviewsDto } from './dto/submit-peer-reviews.dto';

describe('role service', () => {
  let roleService: RoleService;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let user: User;
  let project: Project;
  let role: Role;

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
      ],
    }).compile();

    roleService = module.get(RoleService);
    projectRepository = module.get(ProjectRepository);
    roleRepository = module.get(RoleRepository);
    user = entityFaker.user();
    project = entityFaker.project(user.id);
    role = entityFaker.role(project.id);
  });

  test('should be defined', () => {
    expect(roleService).toBeDefined();
  });

  describe('get roles', () => {
    let queryDto: GetRolesQueryDto;

    beforeEach(() => {
      queryDto = GetRolesQueryDto.from({ projectId: project.id });
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(roleRepository, 'find').mockResolvedValue([role]);
    });

    test('happy path', async () => {
      await expect(roleService.getRoles(queryDto)).resolves.toContainEqual(
        role,
      );
    });
  });

  describe('get role', () => {
    beforeEach(() => {
      jest.spyOn(roleRepository, 'findOneOrFail').mockResolvedValue(role);
    });

    test('happy path', async () => {
      await expect(roleService.getRole(role.id)).resolves.toEqual(role);
    });
  });

  describe('create role', () => {
    let dto: CreateRoleDto;

    beforeEach(() => {
      dto = CreateRoleDto.from({
        projectId: project.id,
        title: primitiveFaker.words(),
        description: primitiveFaker.paragraph(),
      });
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(roleRepository, 'save').mockResolvedValue(role);
    });

    test('happy path', async () => {
      await expect(roleService.createRole(user, dto)).resolves.toEqual(role);
    });
  });

  describe('update role', () => {
    let user: User;
    let project: Project;
    let role: Role;
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
    let user: User;
    let project: Project;
    let role: Role;

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
    let user: User;
    let project: Project;
    let role2: Role;
    let role3: Role;
    let role4: Role;
    let peerReviews: Record<string, number>;
    let dto: SubmitPeerReviewsDto;

    beforeEach(async () => {
      user = entityFaker.user();
      project = entityFaker.project(user.id);
      role.assigneeId = user.id;
      role2 = entityFaker.role(project.id);
      role3 = entityFaker.role(project.id);
      role4 = entityFaker.role(project.id);
      peerReviews = {
        [role2.id]: 0.3,
        [role3.id]: 0.2,
        [role4.id]: 0.5,
      };
      dto = SubmitPeerReviewsDto.from({ peerReviews });
      jest.spyOn(roleRepository, 'findOneOrFail').mockResolvedValue(role);
      jest
        .spyOn(roleRepository, 'find')
        .mockResolvedValue([role2, role3, role4]);
      jest.spyOn(roleRepository, 'save').mockResolvedValue(role);
    });

    test('happy path', async () => {
      await roleService.submitPeerReviews(user, role.id, dto);
      expect(roleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ peerReviews }),
      );
    });
  });
});
