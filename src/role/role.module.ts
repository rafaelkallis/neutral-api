import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';
import { ProjectModule } from '../project/project.module';
import { RoleService } from './services/role.service';
import { RoleController } from './role.controller';
import { RoleEntity } from './entities/role.entity';
import { PeerReviewEntity } from './entities/peer-review.entity';
import { RoleRepository } from './repositories/role.repository';
import { PeerReviewRepository } from './repositories/peer-review.repository';

/**
 * Role Module
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      PeerReviewEntity,
      RoleRepository,
      PeerReviewRepository,
    ]),
    UserModule,
    forwardRef(() => ProjectModule),
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [TypeOrmModule],
})
export class RoleModule {}
