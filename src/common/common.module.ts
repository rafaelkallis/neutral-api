import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectEntity } from './entities/project.entity';
import { RoleEntity } from './entities/role.entity';
import { UserEntity } from './entities/user.entity';
import { EntityNotFoundInterceptor } from './interceptors/entity-not-found.interceptor';
import { ProjectRepository } from './repositories/project.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';
import { ConfigService } from './services/config.service';
import { ContributionsModelService } from './services/contributions-model.service';
import { ConsensualityModelService } from './services/consensuality-model.service';
import { EmailService } from './services/email.service';
import { LogService } from './services/log.service';
import { RandomService } from './services/random.service';
import { TokenService } from './services/token.service';

/**
 * Common Module
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserRepository,
      ProjectEntity,
      ProjectRepository,
      RoleEntity,
      RoleRepository,
    ]),
  ],
  providers: [
    RandomService,
    TokenService,
    LogService,
    ConfigService,
    EmailService,
    ContributionsModelService,
    ConsensualityModelService,
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
    ContributionsModelService,
    ConsensualityModelService,
  ],
})
export class CommonModule {}
