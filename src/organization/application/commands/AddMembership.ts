import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';
import {
  OrganizationCommand,
  OrganizationCommandHandler,
} from './OrganizationCommand';
import { OrganizationRepository } from 'organization/domain/OrganizationRepository';
import { Organization } from 'organization/domain/Organization';
import { OrganizationId } from 'organization/domain/value-objects/OrganizationId';
import { UserId } from 'user/domain/value-objects/UserId';
import { UserRepository } from 'user/domain/UserRepository';
import { UserNotFoundException } from 'user/application/exceptions/UserNotFoundException';
import { DomainException } from 'shared/domain/exceptions/DomainException';
import { Either } from 'shared/domain/Either';
import { Email } from 'user/domain/value-objects/Email';

export class AddMembershipCommand extends OrganizationCommand {
  public readonly member: Either<UserId, Email>;

  public constructor(
    authUser: User,
    organizationId: OrganizationId,
    member: Either<UserId, Email>,
  ) {
    super(authUser, organizationId);
    this.member = member;
  }
}

@Injectable()
@CommandHandler.register(AddMembershipCommand)
export class AddMembershipCommandHandler extends OrganizationCommandHandler<
  AddMembershipCommand
> {
  private readonly userRepository: UserRepository;

  public constructor(
    objectMapper: ObjectMapper,
    organizationRepository: OrganizationRepository,
    userRepository: UserRepository,
  ) {
    super(objectMapper, organizationRepository);
    this.userRepository = userRepository;
  }

  protected async doHandle(
    organization: Organization,
    command: AddMembershipCommand,
  ): Promise<void> {
    organization.assertOwner(command.authUser.id);
    const member = await command.member.fold(
      async (memberId) => this.userRepository.findById(memberId),
      async (memberEmail) => this.userRepository.findByEmail(memberEmail),
    );
    if (!member) {
      throw new UserNotFoundException();
    }
    if (organization.memberships.isAnyMember(member)) {
      throw new DomainException(
        'member_already_exists',
        'User is a member already',
      );
    }
    organization.addMembership(member.id);
  }
}
