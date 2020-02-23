import { ModelFaker } from 'test';
import { UserDto } from 'user/application/dto/UserDto';
import { User } from 'user/domain/User';

describe('user dto', () => {
  let entityFaker: ModelFaker;
  let user: User;

  beforeEach(async () => {
    entityFaker = new ModelFaker();
    user = entityFaker.user();
  });

  test('general', () => {
    const userDto = UserDto.builder()
      .user(user)
      .authUser(user)
      .build();
    expect(userDto).toEqual({
      id: user.id.value,
      email: user.email.value,
      firstName: user.name.first,
      lastName: user.name.last,
      createdAt: user.createdAt.value,
      updatedAt: user.updatedAt.value,
    });
  });

  test('should expose email if authenticated user is user', () => {
    const userDto = UserDto.builder()
      .user(user)
      .authUser(user)
      .build();
    expect(userDto.email).toBeTruthy();
  });

  test('should not expose email if authenticated user is not user', () => {
    const otherUser = entityFaker.user();
    const userDto = UserDto.builder()
      .user(otherUser)
      .authUser(user)
      .build();
    expect(userDto.email).toBeFalsy();
  });
});
