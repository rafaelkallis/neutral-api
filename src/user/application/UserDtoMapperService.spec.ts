import { User } from 'user/domain/User';
import { ModelFaker } from 'test/ModelFaker';
import { UserDtoMapperService } from 'user/application/UserDtoMapperService';
import { MockConfigService } from 'config/infrastructure/MockConfigService';

describe('user dto mapper', () => {
  let userDtoMapper: UserDtoMapperService;
  let modelFaker: ModelFaker;
  let user: User;

  beforeEach(async () => {
    const config = new MockConfigService();
    userDtoMapper = new UserDtoMapperService(config);
    modelFaker = new ModelFaker();
    user = modelFaker.user();
  });

  test('general', () => {
    const userDto = userDtoMapper.toDto(user, user);
    expect(userDto).toEqual({
      id: user.id.value,
      email: user.email.value,
      firstName: user.name.first,
      lastName: user.name.last,
      avatarUrl: null,
      createdAt: user.createdAt.value,
      updatedAt: user.updatedAt.value,
    });
  });

  test('should not expose email if authenticated user is not user', () => {
    const otherUser = modelFaker.user();
    const userDto = userDtoMapper.toDto(user, otherUser);
    expect(userDto.email).toBeFalsy();
  });
});
