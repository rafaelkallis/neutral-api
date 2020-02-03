import { ModelFactoryService } from 'common/domain/ModelFactoryService';
import { UserModel } from 'user';

export interface CreateUserOptions {
  email: string;
  firstName: string;
  lastName: string;
}

export class UserModelFactoryService extends ModelFactoryService {
  /**
   *
   */
  public createUser(userOptions: CreateUserOptions): UserModel {
    const userId = this.createId();
    const createdAt = Date.now();
    const updatedAt = Date.now();
    const { email, firstName, lastName } = userOptions;
    const lastLoginAt = Date.now();
    return new UserModel(
      userId,
      createdAt,
      updatedAt,
      email,
      firstName,
      lastName,
      lastLoginAt,
    );
  }
}
