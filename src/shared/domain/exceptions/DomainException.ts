import { Exception } from 'shared/domain/exceptions/Exception';

export class DomainException extends Exception {
  public constructor(errorCode: string, message: string) {
    super(errorCode, message);
  }
}
