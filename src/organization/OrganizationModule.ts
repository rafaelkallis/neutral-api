import { Module } from '@nestjs/common';
import { UserModule } from 'user/UserModule';
import { SharedModule } from 'shared/SharedModule';
import { OrganizationRepository } from 'organization/domain/OrganizationRepository';
import { Organizations } from 'organization/domain/Organizations';
import { OrganizationController } from 'organization/presentation/OrganizationController';
import {
  OrganizationTypeOrmEntityMap,
  ReverseOrganizationTypeOrmEntityMap,
} from 'organization/infrastructure/OrganizationTypeOrmEntityMap';
import { TypeOrmOrganizationRepository } from 'organization/infrastructure/TypeOrmOrganizationRepository';
import {
  OrganizationMembershipTypeOrmEntityMap,
  ReverseOrganizationMembershipTypeOrmEntityMap,
} from 'organization/infrastructure/OrganizationMembershipTypeOrmEntityMap';
import { CreateOrganizationCommandHandler } from 'organization/application/commands/CreateOgranization';
import { OrganizationDtoMap } from 'organization/presentation/OrganizationDtoMap';
import { GetOrganizationQueryHandler } from 'organization/application/queries/GetOrganizationQuery';

@Module({
  imports: [SharedModule, UserModule],
  controllers: [OrganizationController],
  providers: [
    Organizations,
    {
      provide: OrganizationRepository,
      useClass: TypeOrmOrganizationRepository,
    },
    // query handlers
    GetOrganizationQueryHandler,
    // command handlers
    CreateOrganizationCommandHandler,
    // maps
    OrganizationDtoMap,
    OrganizationTypeOrmEntityMap,
    ReverseOrganizationTypeOrmEntityMap,
    OrganizationMembershipTypeOrmEntityMap,
    ReverseOrganizationMembershipTypeOrmEntityMap,
  ],
  exports: [OrganizationRepository],
})
export class OrganizationModule {}
