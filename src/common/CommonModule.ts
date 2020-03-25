import { Module, Global } from '@nestjs/common';
import { ServiceExplorer } from 'common/application/ServiceExplorer';

/**
 * Common Module
 */
@Global()
@Module({
  providers: [ServiceExplorer],
  exports: [ServiceExplorer],
})
export class CommonModule {}
