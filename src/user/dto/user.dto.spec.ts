import { EntityFaker } from 'test';
import { UserDto } from 'user/dto/user.dto';
import { UserModel } from 'user/user.model';

describe('user dto', () => {
  let entityFaker: EntityFaker;
  let user: UserModel;

  beforeEach(async () => {
    entityFaker = new EntityFaker();
    user = entityFaker.user();
  });

  test('general', () => {
    const userDto = UserDto.builder()
      .user(user)
      .authUser(user)
      .build();
    expect(userDto).toEqual({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
