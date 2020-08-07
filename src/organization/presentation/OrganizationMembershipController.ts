import {
  Controller,
  UseGuards,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AuthGuard, AuthUser } from 'auth/application/guards/AuthGuard';
import { Mediator } from 'shared/mediator/Mediator';
import { User } from 'user/domain/User';
import { OrganizationDto } from './OrganizationDto';
import { AddOrganizationMembershipDto } from './AddOrganizationMembershipDto';
import { AddMembershipCommand } from 'organization/application/commands/AddMembership';
import { OrganizationId } from 'organization/domain/value-objects/OrganizationId';
import { ValidationPipe } from 'shared/application/pipes/ValidationPipe';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { RemoveMembershipCommand } from 'organization/application/commands/RemoveMembership';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { OrganizationMembershipId } from 'organization/domain/value-objects/OrganizationMembershipId';

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
    operationId: 'addOrganizationMembership',
    summary: 'Add an organization membership',
  })
  @ApiCreatedResponse({ type: OrganizationDto })
  public async createOrganizationMembership(
    @AuthUser() authUser: User,
    @Param('organization_id') organizationId: string,
    @Body(ValidationPipe)
    addOrganizationMembershipDto: AddOrganizationMembershipDto,
  ): Promise<OrganizationDto> {
    console.log(addOrganizationMembershipDto);
    return this.mediator.send(
      new AddMembershipCommand(
        authUser,
        OrganizationId.of(organizationId),
        addOrganizationMembershipDto.toEither(),
      ),
    );
  }

  @Delete(':role_id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'removeOrganizationMembership',
    summary: 'Remove an organization membership',
  })
  @ApiOkResponse({
    description: 'Organization membership removed succesfully',
    type: ProjectDto,
  })
  @ApiForbiddenResponse({})
  public async removeOrganizationMembership(
    @AuthUser() authUser: User,
    @Param('project_id') projectId: string,
    @Param('membership_id') membershipId: string,
  ): Promise<ProjectDto> {
    const removeRoleCommand = new RemoveMembershipCommand(
      authUser,
      ProjectId.from(projectId),
      OrganizationMembershipId.of(membershipId),
    );
    return this.mediator.send(removeRoleCommand);
  }
}
