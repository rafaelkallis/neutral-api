import {
  Post,
  Body,
  Param,
  UseGuards,
  Controller,
  HttpStatus,
  HttpCode,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ValidationPipe } from 'shared/application/pipes/ValidationPipe';
import { AuthGuard, AuthUser } from 'auth/application/guards/AuthGuard';
import { User } from 'user/domain/User';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { Mediator } from 'shared/mediator/Mediator';
import { AddReviewTopicDto } from 'project/presentation/dto/AddReviewTopicDto';
import { AddReviewTopicCommand } from 'project/application/commands/AddReviewTopic';
import { UpdateReviewTopicDto } from './dto/UpdateReviewTopicDto';
import { UpdateReviewTopicCommand } from 'project/application/commands/UpdateReviewTopic';

@Controller('projects/:project_id/review-topics')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Projects')
export class ReviewTopicController {
  private readonly mediator: Mediator;

  public constructor(mediator: Mediator) {
    this.mediator = mediator;
  }

  @Post()
  @ApiOperation({
    operationId: 'addReviewTopic',
    summary: 'Add a review topic',
  })
  @ApiCreatedResponse({
    description: 'Review topic added successfully',
    type: ProjectDto,
  })
  @ApiForbiddenResponse({ description: 'User is not the project creator' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  public async addReviewTopic(
    @AuthUser() authUser: User,
    @Param('project_id') projectId: string,
    @Body(ValidationPipe) addReviewTopicDto: AddReviewTopicDto,
  ): Promise<ProjectDto> {
    return this.mediator.send(
      new AddReviewTopicCommand(
        authUser,
        projectId,
        addReviewTopicDto.title,
        addReviewTopicDto.description,
      ),
    );
  }

  @Patch(':review_topic_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'updateReviewTopic',
    summary: 'Update a review topic',
  })
  @ApiCreatedResponse({
    description: 'Review topic updated successfully',
    type: ProjectDto,
  })
  @ApiForbiddenResponse({ description: 'User is not the project creator' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  public async updateReviewTopic(
    @AuthUser() authUser: User,
    @Param('project_id') projectId: string,
    @Param('review_topic_id') reviewTopicId: string,
    @Body(ValidationPipe) updateReviewTopicDto: UpdateReviewTopicDto,
  ): Promise<ProjectDto> {
    return this.mediator.send(
      new UpdateReviewTopicCommand(
        authUser,
        projectId,
        reviewTopicId,
        updateReviewTopicDto.title,
        updateReviewTopicDto.description,
      ),
    );
  }
}
