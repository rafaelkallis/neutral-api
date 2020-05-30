import { Module, Scope } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UnitOfWork } from 'shared/unit-of-work/domain/UnitOfWork';
import { UnitOfWorkInterceptor } from 'shared/unit-of-work/application/UnitOfWorkInterceptor';

@Module({
  providers: [
    {
      provide: UnitOfWork,
      useClass: UnitOfWork,
      scope: Scope.REQUEST,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: UnitOfWorkInterceptor,
      scope: Scope.REQUEST,
    },
  ],
  exports: [UnitOfWork],
})
export class UnitOfWorkModule {}
