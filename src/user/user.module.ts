import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { TypeOrmUserRepository } from 'user/repositories/typeorm-user.repository';
import { USER_REPOSITORY } from 'user/repositories/user.repository';
import { DatabaseModule } from 'database';
import { ConfigModule } from 'config';
import { CommonModule } from 'common/common.module';
import { EmailModule } from 'email';

/**
 * User Module
 */
@Module({
  imports: [ConfigModule, DatabaseModule, CommonModule, EmailModule],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
