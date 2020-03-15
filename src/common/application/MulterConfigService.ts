import { Injectable } from '@nestjs/common';
import {
  MulterOptionsFactory,
  MulterModuleOptions,
} from '@nestjs/platform-express';
import os from 'os';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  public createMulterOptions(): MulterModuleOptions {
    return {
      dest: os.tmpdir(),
    };
  }
}
