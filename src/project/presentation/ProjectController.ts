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

/**
 * Project Controller
 */
@Controller('projects')
@UseGuards(AuthGuard)
@UsePipes(ValidationPipe)
@ApiTags('Projects')
export class ProjectController {
  private readonly projectApplicationService: ProjectApplicationService;

  public constructor(projectApplicationService: ProjectApplicationService) {
    this.projectApplicationService = projectApplicationService;
  }

  /**
   * Get projects
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a list of projects' })
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
  @ApiOperation({ summary: 'Get a project' })
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
  @ApiOperation({ summary: 'Create a project' })
  @ApiCreatedResponse({ type: ProjectDto })
  public async createProject(
    @AuthUser() authUser: User,
    @Body() dto: CreateProjectDto,
  ): Promise<ProjectDto> {
    return this.projectApplicationService.createProject(authUser, dto);
  }

  /**
   * Update a project
   */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id' })
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
  @HttpCode(200)
  @ApiBearerAuth()
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
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({ name: 'id' })
  @ApiNoContentResponse({ description: 'Project deleted succesfully' })
  @ApiForbiddenResponse({
    description: 'Authenticated user is not the project owner',
  })
  public async deleteProject(
    @AuthUser() authUser: User,
    @Param('id') id: string,
  ): Promise<void> {
    return this.projectApplicationService.deleteProject(authUser, id);
  }

  /**
   * Call to submit peer reviews.
   */
  @Post('/:id/submit-peer-reviews')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit peer reviews' })
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
  @Post('/:id/submit-manager-review')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit manager reviews' })
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
