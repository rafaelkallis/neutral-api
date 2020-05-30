import td from 'testdouble';
import { User } from 'user/domain/User';
import { ModelFaker } from 'test/ModelFaker';
import { UserDtoMap } from 'user/application/UserDtoMap';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { Config } from 'shared/config/application/Config';
import { getUserStateValue } from 'user/domain/value-objects/states/UserStateValue';

describe(UserDtoMap.name, () => {
  let userMap: UserDtoMap;
  let primitiveFaker: PrimitiveFaker;
  let modelFaker: ModelFaker;
  let user: User;

  beforeEach(() => {
    const config: Config = td.object();
    td.when(config.get('SERVER_URL')).thenReturn('http://example.com');
    userMap = new UserDtoMap(config);
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();
    user = modelFaker.user();
    user.updateAvatar(Avatar.from(primitiveFaker.id()));
  });

  test('general', () => {
    const userDto = userMap.map(user, {});
    expect(userDto).toEqual({
      id: user.id.value,
      email: user.email.value,
      firstName: user.name.first,
      lastName: user.name.last,
      avatarUrl: 'http://example.com/users/' + user.id.value + '/avatar',
      state: getUserStateValue(user.state),
      createdAt: user.createdAt.value,
      updatedAt: user.updatedAt.value,
    });
  });
});
