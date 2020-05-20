import { Injectable, Scope } from '@nestjs/common';
import { UnitOfWork } from 'shared/unit-of-work/domain/UnitOfWork';

@Injectable({ scope: Scope.REQUEST })
export class RequestUnitOfWork extends UnitOfWork {}
