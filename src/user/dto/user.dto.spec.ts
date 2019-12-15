import { UserEntity } from 'user/entities/user.entity';
import { UserDtoBuilder } from 'user/dto/user.dto';
import { entityFaker } from 'test';

describe('user dto', () => {
  let user: UserEntity;

  beforeEach(() => {
    user = entityFaker.user();
  });

  test('general', () => {
    const userDto = UserDtoBuilder.of(user)
      .withAuthUser(user)
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
    const userDto = UserDtoBuilder.of(user)
      .withAuthUser(user)
      .build();
    expect(userDto.email).toBeTruthy();
  });

  test('should not expose email if authenticated user is not user', () => {
    const otherUser = entityFaker.user();
    const userDto = UserDtoBuilder.of(otherUser)
      .withAuthUser(user)
      .build();
    expect(userDto.email).toBeFalsy();
  });
});
