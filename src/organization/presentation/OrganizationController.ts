import { Controller, UseGuards, Post, Body } from '@nestjs/common';
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
import { CreateOrganizationCommand } from 'organization/application/commands/CreateOgranization';
import { CreateOrganizationDto } from './CreateOrganizationDto';
import { OrganizationName } from 'organization/domain/value-objects/OrganizationName';

@Controller('organizations')
@ApiTags('Organizations')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class OrganizationController {
  private readonly mediator: Mediator;

  public constructor(mediator: Mediator) {
    this.mediator = mediator;
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'createOrganization',
    summary: 'Create an organization',
  })
  @ApiCreatedResponse({ type: OrganizationDto })
  public async createOrganization(
    @AuthUser() authUser: User,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationDto> {
    return this.mediator.send(
      new CreateOrganizationCommand(
        authUser,
        OrganizationName.of(createOrganizationDto.name),
      ),
    );
  }
}
