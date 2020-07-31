import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';
import {
  OrganizationCommand,
  OrganizationCommandHandler,
} from './OrganizationCommand';
import { OrganizationName } from 'organization/domain/value-objects/OrganizationName';
import { Organizations } from 'organization/domain/Organizations';
import { OrganizationRepository } from 'organization/domain/OrganizationRepository';
import { Organization } from 'organization/domain/Organization';

export class CreateOrganizationCommand extends OrganizationCommand {
  public readonly name: OrganizationName;

  public constructor(authUser: User, name: OrganizationName) {
    super(authUser);
    this.name = name;
  }
}

@Injectable()
@CommandHandler.register(CreateOrganizationCommand)
export class CreateOrganizationCommandHandler extends OrganizationCommandHandler<
  CreateOrganizationCommand
> {
  private readonly organizations: Organizations;

  public constructor(
    objectMapper: ObjectMapper,
    organizationRepository: OrganizationRepository,
    organizations: Organizations,
  ) {
    super(objectMapper, organizationRepository);
    this.organizations = organizations;
  }

  protected doHandle(command: CreateOrganizationCommand): Organization {
    return this.organizations.create({
      name: command.name,
      ownerId: command.authUser.id,
    });
  }
}
