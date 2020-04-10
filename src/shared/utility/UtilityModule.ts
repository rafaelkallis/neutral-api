import { Module } from '@nestjs/common';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import { InvocationProxy } from 'shared/utility/application/InvocationProxy';

/**
 * Utility Module
 */
@Module({
  providers: [ServiceExplorer, InvocationProxy],
  exports: [ServiceExplorer, InvocationProxy],
})
export class UtilityModule {}
