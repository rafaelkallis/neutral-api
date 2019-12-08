import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';

import { ProjectController } from './project.controller';
import { ProjectService } from './services/project.service';
import { ContributionsModelService } from './services/contributions-model.service';
import { ConsensualityModelService } from './services/consensuality-model.service';
import { ProjectEntity } from './entities/project.entity';
import { ProjectRepository } from './repositories/project.repository';

/**
 * Project Module
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectEntity, ProjectRepository]),
    UserModule,
    RoleModule,
  ],
  controllers: [ProjectController],
  providers: [
    ProjectService,
    ContributionsModelService,
    ConsensualityModelService,
  ],
  exports: [TypeOrmModule],
})
export class ProjectModule {}
