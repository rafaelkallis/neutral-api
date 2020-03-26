import { Module } from '@nestjs/common';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';

/**
 * Utility Module
 */
@Module({
  providers: [ServiceExplorer],
  exports: [ServiceExplorer],
})
export class UtilityModule {}
