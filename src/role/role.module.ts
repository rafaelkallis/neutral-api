import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from 'user/user.module';
import { ProjectModule } from 'project/project.module';
import { RoleController } from 'role/role.controller';
import { TypeOrmRoleRepository } from 'role/repositories/typeorm-role.repository';
import { TypeOrmPeerReviewRepository } from 'role/repositories/typeorm-peer-review.repository';
import { ROLE_REPOSITORY } from 'role/repositories/role.repository';
import { PEER_REVIEW_REPOSITORY } from 'role/repositories/peer-review.repository';
import { DatabaseModule } from 'database';
import { EmailModule } from 'email';
import { ConfigModule } from 'config';
import { TokenModule } from 'token';
import { EventModule } from 'event';
import { RoleApplicationService } from 'role/services/role-application.service';
import { RoleDomainService } from 'role/services/role-domain.service';

/**
 * Role Module
 */
@Module({
  imports: [
    ConfigModule,
    TokenModule,
    DatabaseModule,
    EmailModule,
    EventModule,
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
    RoleApplicationService,
    RoleDomainService,
  ],
  exports: [ROLE_REPOSITORY, PEER_REVIEW_REPOSITORY],
})
export class RoleModule {}
