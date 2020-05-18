import { Injectable, Scope } from '@nestjs/common';
import { UnitOfWork } from 'shared/domain/unit-of-work/UnitOfWork';

@Injectable({ scope: Scope.REQUEST })
export class RequestUnitOfWork extends UnitOfWork {}
