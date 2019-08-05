import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import {
  UserRepository,
  TokenService,
  RandomService,
  EmailService,
  ConfigService,
  UserNotFoundException,
  TokenAlreadyUsedException,
} from '../common';
import { entityFaker } from '../test';
import { RequestLoginDto } from './dto/request-login.dto';
import { RequestSignupDto } from './dto/request-signup.dto';
import { SubmitSignupDto } from './dto/submit-signup.dto';
import { RefreshDto } from './dto/refresh.dto';

describe('Auth Controller', () => {
  let authController: AuthController;
  let userRepository: UserRepository;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        UserRepository,
        TokenService,
        RandomService,
        EmailService,
        ConfigService,
      ],
    }).compile();

    authController = module.get(AuthController);
    userRepository = module.get(UserRepository);
    emailService = module.get(EmailService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('request magic login', () => {
    beforeEach(() => {
      jest
        .spyOn(userRepository, 'findOneOrFailWith')
        .mockResolvedValue(entityFaker.newUser());
      jest.spyOn(emailService, 'sendLoginEmail').mockResolvedValue();
    });

    test('happy path', async () => {
      const dto = new RequestLoginDto();
      dto.email = 'me@example.com';
      await authController.requestLoginToken(dto);
    });
  });
});
