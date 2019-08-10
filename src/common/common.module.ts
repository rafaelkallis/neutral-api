import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from './entities/project.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { EntityNotFoundInterceptor } from './interceptors/entity-not-found.interceptor';
import { ProjectRepository } from './repositories/project.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';
import { ConfigService } from './services/config.service';
import { EmailService } from './services/email.service';
import { LogService } from './services/log.service';
import { RandomService } from './services/random.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRepository,
      Project,
      ProjectRepository,
      Role,
      RoleRepository,
    ]),
  ],
  providers: [
    RandomService,
    TokenService,
    LogService,
    ConfigService,
    EmailService,
    {
      provide: APP_INTERCEPTOR,
      useClass: EntityNotFoundInterceptor,
    },
  ],
  exports: [
    TypeOrmModule,
    RandomService,
    TokenService,
    LogService,
    ConfigService,
    EmailService,
  ],
})
export class CommonModule {}
