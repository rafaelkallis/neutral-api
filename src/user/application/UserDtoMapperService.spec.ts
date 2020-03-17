import { User } from 'user/domain/User';
import { ModelFaker } from 'test/ModelFaker';
import { UserDtoMapperService } from 'user/application/UserDtoMapperService';
import { MockConfigService } from 'config/infrastructure/MockConfigService';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { PrimitiveFaker } from 'test/PrimitiveFaker';

describe('user dto mapper', () => {
  let userDtoMapper: UserDtoMapperService;
  let primitiveFaker: PrimitiveFaker;
  let modelFaker: ModelFaker;
  let user: User;

  beforeEach(async () => {
    const config = new MockConfigService();
    config.set('SERVER_URL', 'http://example.com');
    userDtoMapper = new UserDtoMapperService(config);
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();
    user = modelFaker.user();
    user.avatar = Avatar.from(primitiveFaker.id());
  });

  test('general', () => {
    const userDto = userDtoMapper.toDto(user, user);
    expect(userDto).toEqual({
      id: user.id.value,
      email: user.email.value,
      firstName: user.name.first,
      lastName: user.name.last,
      avatarUrl: 'http://example.com/users/' + user.id.value + '/avatar',
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
