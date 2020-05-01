import { Post, Body, Param, UseGuards, Controller } from '@nestjs/common';
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

@Controller('projects/:project_id/review-topics')
@UseGuards(AuthGuard)
@ApiTags('Projects')
export class ReviewTopicController {
  private readonly mediator: Mediator;

  public constructor(mediator: Mediator) {
    this.mediator = mediator;
  }

  @Post()
  @ApiBearerAuth()
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
}
