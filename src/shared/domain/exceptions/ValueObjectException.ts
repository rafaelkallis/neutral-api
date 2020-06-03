import { DomainException } from 'shared/domain/exceptions/DomainException';

export class ValueObjectException extends DomainException {
  public constructor(errorCode: string, message: string) {
    super(errorCode, message);
  }
}
