import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';
import { OrganizationName } from 'organization/domain/value-objects/OrganizationName';
import { OrganizationFactory } from 'organization/domain/OrganizationFactory';
import { OrganizationRepository } from 'organization/domain/OrganizationRepository';
import { OrganizationDto } from 'organization/presentation/OrganizationDto';
import { AuthenticatedCommand } from 'shared/command/Command';

export class CreateOrganizationCommand extends AuthenticatedCommand<
  OrganizationDto
> {
  public readonly name: OrganizationName;

  public constructor(authUser: User, name: OrganizationName) {
    super(authUser);
    this.name = name;
  }
}

@Injectable()
@CommandHandler.register(CreateOrganizationCommand)
export class CreateOrganizationCommandHandler extends CommandHandler<
  OrganizationDto,
  CreateOrganizationCommand
> {
  private readonly objectMapper: ObjectMapper;
  private readonly organizationRepository: OrganizationRepository;
  private readonly organizationFactory: OrganizationFactory;

  public constructor(
    objectMapper: ObjectMapper,
    organizationRepository: OrganizationRepository,
    organizationFactory: OrganizationFactory,
  ) {
    super();
    this.objectMapper = objectMapper;
    this.organizationRepository = organizationRepository;
    this.organizationFactory = organizationFactory;
  }

  public async handle(
    command: CreateOrganizationCommand,
  ): Promise<OrganizationDto> {
    const organization = this.organizationFactory.create({
      name: command.name,
      ownerId: command.authUser.id,
    });
    await this.organizationRepository.persist(organization);
    return this.objectMapper.map(organization, OrganizationDto, {
      authUser: command.authUser,
    });
  }
}
