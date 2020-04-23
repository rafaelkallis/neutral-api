import { User } from 'user/domain/User';
import { ModelFaker } from 'test/ModelFaker';
import { UserDtoMap } from 'user/application/UserDtoMap';
import { MockConfig } from 'shared/config/infrastructure/MockConfig';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { PrimitiveFaker } from 'test/PrimitiveFaker';

describe('user map', () => {
  let userMap: UserDtoMap;
  let primitiveFaker: PrimitiveFaker;
  let modelFaker: ModelFaker;
  let user: User;

  beforeEach(async () => {
    const config = new MockConfig();
    config.set('SERVER_URL', 'http://example.com');
    userMap = new UserDtoMap(config);
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();
    user = modelFaker.user();
    user.updateAvatar(Avatar.from(primitiveFaker.id()));
  });

  test('general', () => {
    const userDto = userMap.map(user, { authUser: user });
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

  test('should not expose email of another user', () => {
    const otherUser = modelFaker.user();
    const userDto = userMap.map(user, { authUser: otherUser });
    expect(userDto.email).toBeNull();
  });
});
