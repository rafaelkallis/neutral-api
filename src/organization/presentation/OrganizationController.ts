import { Controller, UseGuards, Post, Body, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AuthGuard, AuthUser } from 'auth/application/guards/AuthGuard';
import { Mediator } from 'shared/mediator/Mediator';
import { User } from 'user/domain/User';
import { OrganizationDto } from './OrganizationDto';
import { CreateOrganizationCommand } from 'organization/application/commands/CreateOgranization';
import { CreateOrganizationDto } from './CreateOrganizationDto';
import { OrganizationName } from 'organization/domain/value-objects/OrganizationName';
import { GetOrganizationQuery } from 'organization/application/queries/GetOrganizationQuery';
import { OrganizationId } from 'organization/domain/value-objects/OrganizationId';
import { ValidationPipe } from 'shared/application/pipes/ValidationPipe';

@Controller('organizations')
@ApiTags('Organizations')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class OrganizationController {
  private readonly mediator: Mediator;

  public constructor(mediator: Mediator) {
    this.mediator = mediator;
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'getOrganization',
    summary: 'Get an organization',
  })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: OrganizationDto })
  @ApiNotFoundResponse({
    description: 'Organization not found or not a member of organization',
  })
  public async getOrganization(
    @AuthUser() authUser: User,
    @Param('id') id: string,
  ): Promise<OrganizationDto> {
    return this.mediator.send(
      new GetOrganizationQuery(authUser, OrganizationId.of(id)),
    );
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
    @Body(ValidationPipe) createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationDto> {
    return this.mediator.send(
      new CreateOrganizationCommand(
        authUser,
        OrganizationName.of(createOrganizationDto.name),
      ),
    );
  }
}
