import { DomainException } from 'shared/domain/exceptions/DomainException';

export class OrganizationNotFound extends DomainException {
  public constructor() {
    super('organization_not_found', 'Organization not found');
  }
}
