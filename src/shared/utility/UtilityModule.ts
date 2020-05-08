import { Module } from '@nestjs/common';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import { InvocationProxy } from 'shared/utility/application/InvocationProxy';
import { Environment } from 'shared/utility/application/Environment';

/**
 * Utility Module
 */
@Module({
  providers: [ServiceExplorer, InvocationProxy, Environment],
  exports: [ServiceExplorer, InvocationProxy, Environment],
})
export class UtilityModule {}
