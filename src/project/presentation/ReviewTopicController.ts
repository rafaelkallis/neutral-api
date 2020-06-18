import {
  Post,
  Body,
  Param,
  UseGuards,
  Controller,
  HttpStatus,
  HttpCode,
  Patch,
  Delete,
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
import { UpdateReviewTopicDto } from 'project/presentation/dto/UpdateReviewTopicDto';
import { UpdateReviewTopicCommand } from 'project/application/commands/UpdateReviewTopic';
import { RemoveReviewTopicCommand } from 'project/application/commands/RemoveReviewTopic';

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
        addReviewTopicDto.input.asReviewTopicInput(),
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

  @Delete(':review_topic_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'removeReviewTopic',
    summary: 'Remove a review topic',
  })
  @ApiCreatedResponse({
    description: 'Review topic remove successfully',
    type: ProjectDto,
  })
  @ApiForbiddenResponse({ description: 'User is not the project creator' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  public async removeReviewTopic(
    @AuthUser() authUser: User,
    @Param('project_id') projectId: string,
    @Param('review_topic_id') reviewTopicId: string,
  ): Promise<ProjectDto> {
    const removeReviewTopicCommand = new RemoveReviewTopicCommand(
      authUser,
      projectId,
      reviewTopicId,
    );
    return this.mediator.send(removeReviewTopicCommand);
  }
}
