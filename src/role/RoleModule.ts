import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from 'user/UserModule';
import { ProjectModule } from 'project/ProjectModule';
import { RoleController } from 'role/RoleController';
import { TypeOrmRoleRepository } from 'role/infrastructure/RoleTypeOrmRepository';
import { TypeOrmPeerReviewRepository } from 'role/infrastructure/PeerReviewTypeOrmRepository';
import { ROLE_REPOSITORY } from 'role/domain/RoleRepository';
import { PEER_REVIEW_REPOSITORY } from 'role/domain/PeerReviewRepository';
import { DatabaseModule } from 'database';
import { EmailModule } from 'email';
import { ConfigModule } from 'config';
import { TokenModule } from 'token';
import { EventModule } from 'event';
import { RoleApplicationService } from 'role/application/RoleApplicationService';
import { RoleDomainService } from 'role/domain/RoleDomainService';
import { RoleTypeOrmEntityMapperService } from 'role/infrastructure/RoleTypeOrmEntityMapperService';
import { PeerReviewTypeOrmEntityMapperService } from 'role/infrastructure/PeerReviewTypeOrmEntityMapperService';

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
    RoleTypeOrmEntityMapperService,
    PeerReviewTypeOrmEntityMapperService,
  ],
  exports: [ROLE_REPOSITORY, PEER_REVIEW_REPOSITORY],
})
export class RoleModule {}
