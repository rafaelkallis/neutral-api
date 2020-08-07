import { User } from 'user/domain/User';
import { Injectable } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';
import {
  OrganizationCommand,
  OrganizationCommandHandler,
} from './OrganizationCommand';
import { Organization } from 'organization/domain/Organization';
import { OrganizationId } from 'organization/domain/value-objects/OrganizationId';
import { OrganizationMembershipId } from 'organization/domain/value-objects/OrganizationMembershipId';

export class RemoveMembershipCommand extends OrganizationCommand {
  public readonly membershipId: OrganizationMembershipId;

  public constructor(
    authUser: User,
    organizationId: OrganizationId,
    membershipId: OrganizationMembershipId,
  ) {
    super(authUser, organizationId);
    this.membershipId = membershipId;
  }
}

@Injectable()
@CommandHandler.register(RemoveMembershipCommand)
export class RemoveMembershipCommandHandler extends OrganizationCommandHandler<
  RemoveMembershipCommand
> {
  protected async doHandle(
    organization: Organization,
    command: RemoveMembershipCommand,
  ): Promise<void> {
    const membershipToRemove = organization.memberships.whereId(
      command.membershipId,
    );
    const authUserMembership = organization.memberships.whereMember(
      command.authUser,
    );
    if (!authUserMembership.equals(membershipToRemove)) {
      organization.assertOwner(command.authUser.id);
    }
    organization.removeMembership(membershipToRemove);
  }
}
