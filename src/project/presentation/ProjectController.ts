import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Query,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { ValidationPipe } from 'shared/application/pipes/ValidationPipe';
import { AuthGuard, AuthUser } from 'auth/application/guards/AuthGuard';
import { User } from 'user/domain/User';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import { GetProjectsQueryDto } from 'project/application/dto/GetProjectsQueryDto';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { CreateProjectDto } from 'project/application/dto/CreateProjectDto';
import { UpdateProjectDto } from 'project/application/dto/UpdateProjectDto';
import { SubmitPeerReviewsDto } from 'project/application/dto/SubmitPeerReviewsDto';
import { Mediator } from 'shared/mediator/Mediator';
import { CreateProjectCommand } from 'project/application/commands/CreateProject';

/**
 * Project Controller
 */
@Controller('projects')
@UseGuards(AuthGuard)
@UsePipes(ValidationPipe)
@ApiTags('Projects')
export class ProjectController {
  private readonly projectApplicationService: ProjectApplicationService;
  private readonly mediator: Mediator;

  public constructor(
    projectApplicationService: ProjectApplicationService,
    mediator: Mediator,
  ) {
    this.projectApplicationService = projectApplicationService;
    this.mediator = mediator;
  }

  /**
   * Get projects
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'getProjects',
    summary: 'Get a list of projects',
  })
  @ApiOkResponse({ description: 'A list of projects', type: [ProjectDto] })
  public async getProjects(
    @AuthUser() authUser: User,
    @Query() query: GetProjectsQueryDto,
  ): Promise<ProjectDto[]> {
    return this.projectApplicationService.getProjects(authUser, query);
  }

  /**
   * Get a project
   */
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'getProject', summary: 'Get a project' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'The requested project', type: ProjectDto })
  @ApiNotFoundResponse({ description: 'Project not found' })
  public async getProject(
    @AuthUser() authUser: User,
    @Param('id') id: string,
  ): Promise<ProjectDto> {
    return this.projectApplicationService.getProject(authUser, id);
  }

  /**
   * Create a project
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'createProject', summary: 'Create a project' })
  @ApiCreatedResponse({ type: ProjectDto })
  public async createProject(
    @AuthUser() authUser: User,
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ProjectDto> {
    return this.mediator.send(
      new CreateProjectCommand(
        authUser,
        createProjectDto.title,
        createProjectDto.description,
        createProjectDto.contributionVisibility,
        createProjectDto.skipManagerReview,
      ),
    );
  }

  /**
   * Update a project
   */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'updateProject', summary: 'Update a project' })
  @ApiOkResponse({
    description: 'Project updated succesfully',
    type: ProjectDto,
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user is not the project owner',
  })
  public async updateProject(
    @AuthUser() authUser: User,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectDto> {
    return this.projectApplicationService.updateProject(authUser, id, dto);
  }

  /**
   * Finish project formation.
   */
  @Post('/:id/finish-formation')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'finishFormation',
    summary: 'Finish the project formation',
  })
  @ApiOkResponse({
    description: 'Formation finished successfully.',
    type: ProjectDto,
  })
  @ApiBadRequestResponse({ description: 'Project is not in formation state' })
  @ApiBadRequestResponse({ description: 'Project has an unassigned role' })
  @ApiForbiddenResponse({
    description: 'Authenticated user is not the project owner',
  })
  public async finishFormation(
    @AuthUser() authUser: User,
    @Param('id') id: string,
  ): Promise<ProjectDto> {
    return this.projectApplicationService.finishFormation(authUser, id);
  }

  /**
   * Delete a project
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'deleteProject',
    summary: 'Archive a project. Use "/:id/archive" instead!',
    deprecated: true,
  })
  @ApiNoContentResponse({ description: 'Project archived succesfully' })
  @ApiForbiddenResponse({
    description: 'Authenticated user is not the project owner',
  })
  public async deleteProject(
    @AuthUser() authUser: User,
    @Param('id') id: string,
  ): Promise<void> {
    await this.projectApplicationService.archiveProject(authUser, id);
  }

  /**
   * Archive a project
   */
  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'archiveProject', summary: 'Archive a project' })
  @ApiOkResponse({
    description: 'Project archived succesfully',
    type: ProjectDto,
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user is not the project owner',
  })
  public async archiveProject(
    @AuthUser() authUser: User,
    @Param('id') id: string,
  ): Promise<ProjectDto> {
    return this.projectApplicationService.archiveProject(authUser, id);
  }

  /**
   * Call to submit peer reviews.
   */
  @Post(':id/submit-peer-reviews')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'submitPeerReviews',
    summary: 'Submit peer reviews',
  })
  @ApiOkResponse({
    description: 'Peer reviews submitted successfully',
    type: ProjectDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid peer reviews' })
  @ApiBadRequestResponse({ description: 'Not a project participant' })
  public async submitPeerReviews(
    @AuthUser() authUser: User,
    @Param('id') id: string,
    @Body() dto: SubmitPeerReviewsDto,
  ): Promise<ProjectDto> {
    return this.projectApplicationService.submitPeerReviews(authUser, id, dto);
  }

  /**
   * Call to submit manager review.
   */
  @Post(':id/submit-manager-review')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'submitManagerReview',
    summary: 'Submit manager reviews',
  })
  @ApiOkResponse({
    description: 'Manager review submitted successfully',
    type: ProjectDto,
  })
  @ApiBadRequestResponse({ description: 'Project not in manager-review state' })
  @ApiBadRequestResponse({ description: 'Not the project owner' })
  public async submitManagerReview(
    @AuthUser() authUser: User,
    @Param('id') id: string,
  ): Promise<ProjectDto> {
    return this.projectApplicationService.submitManagerReview(authUser, id);
  }
}
