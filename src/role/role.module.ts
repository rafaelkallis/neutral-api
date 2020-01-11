import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from 'user/user.module';
import { ProjectModule } from 'project/project.module';
import { RoleService } from 'role/services/role.service';
import { RoleController } from 'role/role.controller';
import { TypeOrmRoleRepository } from 'role/repositories/typeorm-role.repository';
import { TypeOrmPeerReviewRepository } from 'role/repositories/typeorm-peer-review.repository';
import { ROLE_REPOSITORY } from 'role/repositories/role.repository';
import { PEER_REVIEW_REPOSITORY } from 'role/repositories/peer-review.repository';
import { DatabaseModule } from 'database';
import { EmailModule } from 'email';
import { ConfigModule } from 'config';
import { TokenModule } from 'token';

/**
 * Role Module
 */
@Module({
  imports: [
    ConfigModule,
    TokenModule,
    DatabaseModule,
    EmailModule,
    UserModule,
    forwardRef(() => ProjectModule),
  ],
  controllers: [RoleController],
  providers: [
    {
      provide: ROLE_REPOSITORY,
      useClass: TypeOrmRoleRepository,
    },
    {
      provide: PEER_REVIEW_REPOSITORY,
      useClass: TypeOrmPeerReviewRepository,
    },
    RoleService,
  ],
  exports: [ROLE_REPOSITORY, PEER_REVIEW_REPOSITORY],
})
export class RoleModule {}
