import { Repository } from 'shared/domain/Repository';
import { OrganizationId } from './value-objects/OrganizationId';
import { Organization } from './Organization';
import { UserId } from 'user/domain/value-objects/UserId';

@Repository.register(Organization)
export abstract class OrganizationRepository extends Repository<
  OrganizationId,
  Organization
> {
  public abstract findByOwnerId(ownerId: UserId): Promise<Organization[]>;
}
