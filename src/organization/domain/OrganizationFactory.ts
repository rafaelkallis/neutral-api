import { Injectable } from '@nestjs/common';
import { AggregateRootFactory } from 'shared/application/AggregateRootFactory';
import { OrganizationId } from './value-objects/OrganizationId';
import { Organization, CreateOrganizationContext } from './Organization';

@Injectable()
export class OrganizationFactory extends AggregateRootFactory<
  CreateOrganizationContext,
  OrganizationId,
  Organization
> {
  protected doCreate(context: CreateOrganizationContext): Organization {
    return Organization.create(context);
  }
}
