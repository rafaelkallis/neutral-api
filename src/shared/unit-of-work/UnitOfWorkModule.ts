import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UnitOfWork } from 'shared/unit-of-work/domain/UnitOfWork';
import { RequestUnitOfWork } from 'shared/unit-of-work/application/RequestUnitOfWork';
import { UnitOfWorkInterceptor } from 'shared/unit-of-work/application/UnitOfWorkInterceptor';

@Module({
  providers: [
    { provide: UnitOfWork, useClass: RequestUnitOfWork },
    { provide: APP_INTERCEPTOR, useClass: UnitOfWorkInterceptor },
  ],
  exports: [UnitOfWork],
})
export class UnitOfWorkModule {}
