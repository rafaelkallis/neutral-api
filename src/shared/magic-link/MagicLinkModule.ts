import { Module } from '@nestjs/common';
import { ConfigModule } from 'shared/config/ConfigModule';
import { TokenModule } from 'shared/token/TokenModule';
import { MagicLinkFactory } from './MagicLinkFactory';

@Module({
  imports: [ConfigModule, TokenModule],
  providers: [MagicLinkFactory],
  exports: [MagicLinkFactory],
})
export class MagicLinkModule {}
