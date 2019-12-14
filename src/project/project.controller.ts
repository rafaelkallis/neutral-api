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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard, AuthUser, ValidationPipe } from '../common';
import { UserEntity } from '../user';
import { ProjectService } from './services/project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { GetProjectsQueryDto } from './dto/get-projects-query.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectDto } from './dto/project.dto';
import { SubmitPeerReviewsDto } from './dto/submit-peer-reviews.dto';

/**
 * Project Controller
 */
@Controller('projects')
@UseGuards(AuthGuard)
@UsePipes(ValidationPipe)
@ApiTags('Projects')
export class ProjectController {
  private readonly projectService: ProjectService;

  public constructor(projectService: ProjectService) {
    this.projectService = projectService;
  }

  /**
   * Get projects
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a list of projects' })
  @ApiResponse({ status: 200, description: 'A list of projects' })
  public async getProjects(
    @AuthUser() authUser: UserEntity,
    @Query() query: GetProjectsQueryDto,
  ): Promise<ProjectDto[]> {
    return this.projectService.getProjects(authUser, query);
  }

  /**
   * Get a project
   */
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a project' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'The requested project' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  public async getProject(
    @AuthUser() authUser: UserEntity,
    @Param('id') id: string,
  ): Promise<ProjectDto> {
    return this.projectService.getProject(authUser, id);
  }

  /**
   * Create a project
   */
  @Post()
  @ApiBearerAuth()
  public async createProject(
    @AuthUser() authUser: UserEntity,
    @Body() dto: CreateProjectDto,
  ): Promise<ProjectDto> {
    return this.projectService.createProject(authUser, dto);
  }

  /**
   * Update a project
   */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Project updated succesfully' })
  @ApiResponse({
    status: 403,
    description: 'Authenticated user is not the project owner',
  })
  public async updateProject(
    @AuthUser() authUser: UserEntity,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectDto> {
    return this.projectService.updateProject(authUser, id, dto);
  }

  /**
   * Finish project formation.
   */
  @Post('/:id/finish-formation')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Formation finished successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Project is not in formation state',
  })
  @ApiResponse({ status: 400, description: 'Project has an unassigned role' })
  @ApiResponse({
    status: 403,
    description: 'Authenticated user is not the project owner',
  })
  public async finishFormation(
    @AuthUser() authUser: UserEntity,
    @Param('id') id: string,
  ): Promise<ProjectDto> {
    return this.projectService.finishFormation(authUser, id);
  }

  /**
   * Delete a project
   */
  @Delete(':id')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204, description: 'Project deleted succesfully' })
  @ApiResponse({
    status: 403,
    description: 'Authenticated user is not the project owner',
  })
  public async deleteProject(
    @AuthUser() authUser: UserEntity,
    @Param('id') id: string,
  ): Promise<void> {
    return this.projectService.deleteProject(authUser, id);
  }

  /**
   * Call to submit peer reviews.
   */
  @Post('/:id/submit-peer-reviews')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit peer reviews' })
  @ApiResponse({
    status: 200,
    description: 'Peer reviews submitted successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid peer reviews' })
  @ApiResponse({ status: 400, description: 'Not a project participant' })
  public async submitPeerReviews(
    @AuthUser() authUser: UserEntity,
    @Param('id') id: string,
    @Body() dto: SubmitPeerReviewsDto,
  ): Promise<void> {
    return this.projectService.submitPeerReviews(authUser, id, dto);
  }

  /**
   * Call to submit manager review.
   */
  @Post('/:id/submit-manager-review')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit manager reviews' })
  @ApiResponse({
    status: 200,
    description: 'Manager review submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Project not in manager-review state',
  })
  @ApiResponse({ status: 400, description: 'Not the project owner' })
  public async submitManagerReview(
    @AuthUser() authUser: UserEntity,
    @Param('id') id: string,
  ): Promise<void> {
    return this.projectService.submitManagerReview(authUser, id);
  }
}
