import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RandomService } from './services/random.service';
import { TokenService } from './services/token.service';
import { LogService } from './services/log.service';
import { ConfigService } from './services/config.service';
import { EmailService } from './services/email.service';

import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

import { Project } from './entities/project.entity';
import { ProjectRepository } from './repositories/project.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRepository,
      Project,
      ProjectRepository,
    ]),
  ],
  providers: [
    RandomService,
    TokenService,
    LogService,
    ConfigService,
    EmailService,
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
