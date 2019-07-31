import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findOne(id: string, error: Error): Promise<User> {
    const user = this.userRepository.findOne(id);
    if (!user) {
      throw error;
    }
    return user;
  }

  async findOneByEmail(email: string, error: Error): Promise<User> {
    const user = this.userRepository.findOne({ email });
    if (!user) {
      throw error;
    }
    return user;
  }
}
