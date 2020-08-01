import { Module } from '@nestjs/common';
import { UserModule } from 'user/UserModule';
import { SharedModule } from 'shared/SharedModule';
import { OrganizationRepository } from 'organization/domain/OrganizationRepository';
import { OrganizationFactory } from 'organization/domain/OrganizationFactory';
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
import { OrganizationMembershipController } from './presentation/OrganizationMembershipController';
import { AddMembershipCommandHandler } from './application/commands/AddMembership';
import { OrganizationMembershipDtoMap } from './presentation/OrganizationMembershipDtoMap';

@Module({
  imports: [SharedModule, UserModule],
  controllers: [OrganizationController, OrganizationMembershipController],
  providers: [
    OrganizationFactory,
    {
      provide: OrganizationRepository,
      useClass: TypeOrmOrganizationRepository,
    },
    // query handlers
    GetOrganizationQueryHandler,
    // command handlers
    CreateOrganizationCommandHandler,
    AddMembershipCommandHandler,
    // maps
    OrganizationDtoMap,
    OrganizationMembershipDtoMap,
    OrganizationTypeOrmEntityMap,
    ReverseOrganizationTypeOrmEntityMap,
    OrganizationMembershipTypeOrmEntityMap,
    ReverseOrganizationMembershipTypeOrmEntityMap,
  ],
  exports: [OrganizationRepository],
})
export class OrganizationModule {}
