import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { delayWhen } from 'rxjs/operators';
import { UnitOfWork } from 'shared/domain/unit-of-work/UnitOfWork';
import { Observable, from } from 'rxjs';

@Injectable()
export class UnitOfWorkInterceptor implements NestInterceptor {
  private readonly unitOfWork: UnitOfWork;

  public constructor(unitOfWork: UnitOfWork) {
    this.unitOfWork = unitOfWork;
  }

  public intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(delayWhen(() => from(this.unitOfWork.commit())));
  }
}
