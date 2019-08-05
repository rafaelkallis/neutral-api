import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import {
  UserRepository,
  ProjectRepository,
  RandomService,
  TokenService,
  ConfigService,
} from '../common';

describe('Project Controller', () => {
  let controller: ProjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        UserRepository,
        ProjectRepository,
        TokenService,
        RandomService,
        ConfigService,
      ],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
