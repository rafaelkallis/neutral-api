import {
  Post,
  Body,
  Param,
  UseGuards,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ValidationPipe } from 'shared/application/pipes/ValidationPipe';
import { AuthGuard, AuthUser } from 'auth/application/guards/AuthGuard';
import { User } from 'user/domain/User';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { Mediator } from 'shared/mediator/Mediator';
import { AddMilestoneDto } from './dto/AddMilestoneDto';
import { AddMilestoneCommand } from 'project/application/commands/AddMilestone';
import { CancelLatestMilestoneCommand } from 'project/application/commands/CancelLatestMilestone';

@Controller('projects/:project_id/milestones')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Projects')
export class MilestoneController {
  private readonly mediator: Mediator;

  public constructor(mediator: Mediator) {
    this.mediator = mediator;
  }

  @Post()
  @ApiOperation({
    operationId: 'addMilestone',
    summary: 'Add a milestone',
  })
  @ApiCreatedResponse({
    description: 'Milestone added successfully',
    type: ProjectDto,
  })
  @ApiBadRequestResponse({ description: 'Pending milestone.' })
  @ApiForbiddenResponse({ description: 'User is not the project creator.' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  public async addMilestone(
    @AuthUser() authUser: User,
    @Param('project_id') projectId: string,
    @Body(ValidationPipe) addMilestoneDto: AddMilestoneDto,
  ): Promise<ProjectDto> {
    return await this.mediator.send(
      new AddMilestoneCommand(
        authUser,
        projectId,
        addMilestoneDto.title,
        addMilestoneDto.description,
      ),
    );
  }

  @Delete('latest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'cancelLatestMilestone',
    summary: 'Cancel the latest milestone.',
  })
  @ApiCreatedResponse({
    description: 'Latest milestone cancelled successfully',
    type: ProjectDto,
  })
  @ApiForbiddenResponse({ description: 'User is not the project creator' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  public async removeReviewTopic(
    @AuthUser() authUser: User,
    @Param('project_id') projectId: string,
  ): Promise<ProjectDto> {
    return await this.mediator.send(
      new CancelLatestMilestoneCommand(authUser, projectId),
    );
  }
}
