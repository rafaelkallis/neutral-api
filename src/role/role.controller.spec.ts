import { Test } from '@nestjs/testing';
import { RoleController } from './role.controller';
import {
  ConfigService,
  TokenService,
  RandomService,
  UserRepository,
  Project,
  Role,
  ProjectRepository,
  RoleRepository,
} from '../common';
import { entityFaker } from '../test';
import { GetRolesQueryDto } from './dto/get-roles-query.dto';

describe('Role Controller', () => {
  let roleController: RoleController;
  let projectRepository: ProjectRepository;
  let roleRepository: RoleRepository;
  let project: Project;
  let role: Role;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        RandomService,
        ConfigService,
        RoleRepository,
        UserRepository,
        ProjectRepository,
        TokenService,
      ],
    }).compile();

    roleController = module.get(RoleController);
    projectRepository = module.get(ProjectRepository);
    roleRepository = module.get(RoleRepository);
    const user = entityFaker.user();
    project = entityFaker.project(user.id);
    role = entityFaker.role(project.id);
  });

  test('should be defined', () => {
    expect(roleController).toBeDefined();
  });

  describe('get roles', () => {
    let queryDto: GetRolesQueryDto;
    beforeEach(() => {
      queryDto = new GetRolesQueryDto();
      queryDto.projectId = project.id;
      jest.spyOn(projectRepository, 'findOneOrFail').mockResolvedValue(project);
      jest.spyOn(roleRepository, 'find').mockResolvedValue([role]);
    });

    test('happy path', async () => {
      await expect(roleController.getRoles(queryDto)).resolves.toContainEqual(
        role,
      );
    });
  });
  
  describe('get role', () => {
    beforeEach(() => {
      jest.spyOn(roleRepository, 'findOneOrFail').mockResolvedValue(role);
    });

    test('happy path', async () => {
      await expect(roleController.getRole(role.id)).resolves.toEqual(
        role,
      );
    });
  });
});
