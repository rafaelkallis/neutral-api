import { AuthenticatedCommand } from 'shared/command/Command';
import { CommandHandler } from 'shared/command/CommandHandler';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { Injectable } from '@nestjs/common';
import { OrganizationDto } from 'organization/presentation/OrganizationDto';
import { OrganizationRepository } from 'organization/domain/OrganizationRepository';
import { Organization } from 'organization/domain/Organization';

export abstract class OrganizationCommand extends AuthenticatedCommand<
  OrganizationDto
> {}

@Injectable()
export abstract class OrganizationCommandHandler<
  TCommand extends OrganizationCommand
> extends CommandHandler<OrganizationDto, TCommand> {
  protected readonly objectMapper: ObjectMapper;
  protected readonly organizationRepository: OrganizationRepository;

  public constructor(
    objectMapper: ObjectMapper,
    organizationRepository: OrganizationRepository,
  ) {
    super();
    this.objectMapper = objectMapper;
    this.organizationRepository = organizationRepository;
  }

  public async handle(command: TCommand): Promise<OrganizationDto> {
    const organization = await this.doHandle(command);
    await this.organizationRepository.persist(organization);
    return this.objectMapper.map(organization, OrganizationDto, {
      authUser: command.authUser,
    });
  }

  protected abstract doHandle(
    command: TCommand,
  ): Organization | Promise<Organization>;
}
