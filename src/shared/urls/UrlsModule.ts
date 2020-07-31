import { Module } from '@nestjs/common';
import { ConfigModule } from 'shared/config/ConfigModule';
import { TokenModule } from 'shared/token/TokenModule';
import { MagicLinkFactory } from './MagicLinkFactory';
import { CtaUrlFactory } from './CtaUrlFactory';

@Module({
  imports: [ConfigModule, TokenModule],
  providers: [MagicLinkFactory, CtaUrlFactory],
  exports: [MagicLinkFactory, CtaUrlFactory],
})
export class UrlsModule {}
