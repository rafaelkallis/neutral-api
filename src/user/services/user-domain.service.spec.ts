import { EntityFaker, PrimitiveFaker } from 'test';
import { UserEntity } from 'user/entities/user.entity';
import { UserRepository } from 'user/repositories/user.repository';
import { UserDto } from 'user/dto/user.dto';
import { GetUsersQueryDto } from 'user/dto/get-users-query.dto';
import { UpdateUserDto } from 'user/dto/update-user.dto';
import { FakeUserRepository } from 'user/repositories/fake-user.repository';
import { MockEmailSender, EmailSender } from 'email';
import { MockConfig, Config } from 'config';
import { MockTokenService, TokenService } from 'token';
import {
  UserDomainService,
  UpdateUserOptions,
} from 'user/services/user-domain.service';
import { MockEventBus } from 'event';

describe('user service', () => {
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;
  let config: Config;
  let eventBus: MockEventBus;
  let userRepository: UserRepository;
  let emailSender: EmailSender;
  let tokenService: TokenService;
  let userDomainService: UserDomainService;
  let user: UserEntity;

  beforeEach(async () => {
    primitiveFaker = new PrimitiveFaker();
    entityFaker = new EntityFaker();
    config = new MockConfig();
    eventBus = new MockEventBus();
    userRepository = new FakeUserRepository();
    emailSender = new MockEmailSender();
    tokenService = new MockTokenService();
    userDomainService = new UserDomainService(
      config,
      eventBus,
      userRepository,
      tokenService,
      emailSender,
    );

    user = entityFaker.user();
    await userRepository.persist(user);
  });

  it('should be defined', () => {
    expect(userDomainService).toBeDefined();
  });

  describe('update user', () => {
    let email: string;
    let firstName: string;
    let updateUserOptions: UpdateUserOptions;

    beforeEach(() => {
      email = primitiveFaker.email();
      firstName = primitiveFaker.word();
      updateUserOptions = { email, firstName };
      jest.spyOn(userRepository, 'persist');
      jest.spyOn(emailSender, 'sendEmailChangeEmail');
    });

    test('happy path', async () => {
      await userDomainService.updateUser(user, updateUserOptions);
      expect(emailSender.sendEmailChangeEmail).toHaveBeenCalledWith(
        email,
        expect.any(String),
      );
      expect(userRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({ firstName }),
      );
    });
  });

  describe('submit email change', () => {
    let newEmail: string;
    let emailChangeToken: string;

    beforeEach(() => {
      newEmail = primitiveFaker.word();
      emailChangeToken = tokenService.newEmailChangeToken(
        user.id,
        user.email,
        newEmail,
      );
      jest.spyOn(userRepository, 'persist');
    });

    test('happy path', async () => {
      await userDomainService.submitEmailChange(emailChangeToken);
      expect(userRepository.persist).toHaveBeenCalledWith(
        expect.objectContaining({ email: newEmail }),
      );
    });
  });

  describe('delete user', () => {
    beforeEach(() => {
      jest.spyOn(userRepository, 'delete');
    });

    test('happy path', async () => {
      await userDomainService.deleteUser(user);
      expect(userRepository.delete).toHaveBeenCalledWith(user);
    });
  });
});
