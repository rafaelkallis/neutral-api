import { EntityFaker, PrimitiveFaker } from 'test';
import { UserRepository } from 'user/repositories/user.repository';
import { FakeUserRepository } from 'user/repositories/fake-user.repository';
import { MockConfigService, ConfigService } from 'config';
import { MockTokenService, TokenService } from 'token';
import {
  UserDomainService,
  UpdateUserOptions,
} from 'user/services/user-domain.service';
import { MockEventPublisherService } from 'event';
import { UserModel } from 'user/user.model';

describe('user service', () => {
  let entityFaker: EntityFaker;
  let primitiveFaker: PrimitiveFaker;
  let config: ConfigService;
  let eventPublisher: MockEventPublisherService;
  let userRepository: UserRepository;
  let tokenService: TokenService;
  let userDomainService: UserDomainService;
  let user: UserModel;

  beforeEach(async () => {
    primitiveFaker = new PrimitiveFaker();
    entityFaker = new EntityFaker();
    config = new MockConfigService();
    eventPublisher = new MockEventPublisherService();
    userRepository = new FakeUserRepository();
    tokenService = new MockTokenService();
    userDomainService = new UserDomainService(
      config,
      eventPublisher,
      userRepository,
      tokenService,
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
    });

    test('happy path', async () => {
      await userDomainService.updateUser(user, updateUserOptions);
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
