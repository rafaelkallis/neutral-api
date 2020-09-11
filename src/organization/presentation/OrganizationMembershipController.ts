import { Controller, UseGuards, Post, Body, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { AuthGuard, AuthUser } from 'auth/application/guards/AuthGuard';
import { Mediator } from 'shared/mediator/Mediator';
import { User } from 'user/domain/User';
import { OrganizationDto } from './OrganizationDto';
import { AddOrganizationMembershipDto } from './AddOrganizationMembershipDto';
import { AddMembershipCommand } from 'organization/application/commands/AddMembership';
import { OrganizationId } from 'organization/domain/value-objects/OrganizationId';
import { ValidationPipe } from 'shared/application/pipes/ValidationPipe';

@Controller('organizations/:organization_id/memberships')
@ApiTags('Organizations')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class OrganizationMembershipController {
  private readonly mediator: Mediator;

  public constructor(mediator: Mediator) {
    this.mediator = mediator;
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'createOrganizationMembership',
    summary: 'Create an organization membership',
  })
  @ApiCreatedResponse({ type: OrganizationDto })
  public async createOrganizationMembership(
    @AuthUser() authUser: User,
    @Param('organization_id') organizationId: string,
    @Body(ValidationPipe)
    addOrganizationMembershipDto: AddOrganizationMembershipDto,
  ): Promise<OrganizationDto> {
    return this.mediator.send(
      new AddMembershipCommand(
        authUser,
        OrganizationId.of(organizationId),
        addOrganizationMembershipDto.toEither(),
      ),
    );
  }
}
