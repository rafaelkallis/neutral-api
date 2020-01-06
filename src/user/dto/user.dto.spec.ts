import { Test } from '@nestjs/testing';
import { EntityFaker } from 'test';
import { TestModule } from 'test/test.module';
import { UserEntity } from 'user/entities/user.entity';
import { UserDto } from 'user/dto/user.dto';
import { UserRepository } from 'user/repositories/user.repository';
import { MemoryUserRepository } from 'user/repositories/memory-user.repository';

describe('user dto', () => {
  let entityFaker: EntityFaker;
  let userRepository: UserRepository;
  let user: UserEntity;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TestModule],
      providers: [MemoryUserRepository],
    }).compile();

    entityFaker = module.get(EntityFaker);
    userRepository = module.get(MemoryUserRepository);
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
    const otherUser = userRepository.createEntity(entityFaker.user());
    const userDto = UserDto.builder()
      .user(otherUser)
      .authUser(user)
      .build();
    expect(userDto.email).toBeFalsy();
  });
});
