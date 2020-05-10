import { Module } from '@nestjs/common';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import { InvocationProxy } from 'shared/utility/application/InvocationProxy';
import { Environment } from 'shared/utility/application/Environment';
import { TempFileFactory } from 'shared/utility/application/TempFileFactory';

/**
 * Utility Module
 */
@Module({
  providers: [ServiceExplorer, InvocationProxy, Environment, TempFileFactory],
  exports: [ServiceExplorer, InvocationProxy, Environment, TempFileFactory],
})
export class UtilityModule {}
