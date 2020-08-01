import { AuthenticatedCommand } from 'shared/command/Command';
import { CommandHandler } from 'shared/command/CommandHandler';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { Injectable } from '@nestjs/common';
import { OrganizationDto } from 'organization/presentation/OrganizationDto';
import { OrganizationRepository } from 'organization/domain/OrganizationRepository';
import { Organization } from 'organization/domain/Organization';
import { OrganizationId } from 'organization/domain/value-objects/OrganizationId';
import { User } from 'user/domain/User';
import { DomainException } from 'shared/domain/exceptions/DomainException';

export abstract class OrganizationCommand extends AuthenticatedCommand<
  OrganizationDto
> {
  public readonly organizationId: OrganizationId;

  public constructor(authUser: User, organizationId: OrganizationId) {
    super(authUser);
    this.organizationId = organizationId;
  }
}

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
    const organization = await this.organizationRepository.findById(
      command.organizationId,
    );
    if (!organization) {
      // TODO replace with OrganizationNotFound
      throw new DomainException(
        'organization_not_found',
        'Organization not found',
      );
    }
    await this.doHandle(organization, command);
    await this.organizationRepository.persist(organization);
    return this.objectMapper.map(organization, OrganizationDto, {
      authUser: command.authUser,
    });
  }

  protected abstract doHandle(
    organization: Organization,
    command: TCommand,
  ): void | Promise<void>;
}
