import { Module } from '@nestjs/common';
import { UserModule } from 'user/UserModule';
import { SharedModule } from 'shared/SharedModule';
// import { OrganizationRepository } from './domain/OrganizationRepository';
import { Organizations } from './domain/Organizations';
import { OrganizationController } from './presentation/OrganizationController';

@Module({
  imports: [SharedModule, UserModule],
  controllers: [OrganizationController],
  providers: [
    Organizations,
    // {
    //   provide: OrganizationRepository,
    //   useClass: TypeOrmOrganizationRepository,
    // },
  ],
  // exports: [OrganizationRepository],
})
export class OrganizationModule {}
