import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class Environment implements OnModuleInit {
  public onModuleInit(): void {
    if (!process.env.NODE_ENV) {
      throw new Error('NODE_ENV not defined');
    }
    if (!['production', 'development', 'test'].includes(process.env.NODE_ENV)) {
      throw new Error('NODE_ENV does not equal one of the predefined values');
    }
  }

  public isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  public isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  public isTest(): boolean {
    return process.env.NODE_ENV === 'test';
  }
}
