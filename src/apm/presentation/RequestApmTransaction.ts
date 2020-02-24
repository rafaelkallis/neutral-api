import {
  createParamDecorator,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApmTransaction } from 'apm/application/Apm';

/**
 * Extract the request's apm transaction.
 */
export const RequestApmTransaction = createParamDecorator(
  (_, req): ApmTransaction => {
    if (!req.apmTransaction) {
      throw new InternalServerErrorException();
    }
    return req.apmTransaction;
  },
);
