import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';

describe('Role Controller', () => {
  let roleController: RoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
    }).compile();

    roleController = module.get<RoleController>(RoleController);
  });

  test('should be defined', () => {
    expect(roleController).toBeDefined();
  });
});
