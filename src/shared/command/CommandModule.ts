import { Module } from '@nestjs/common';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { CommandMediator } from 'shared/command/CommandMediator';

/**
 * Command Module
 */
@Module({
  imports: [UtilityModule],
  providers: [CommandMediator],
  exports: [CommandMediator],
})
export class CommandModule {}
