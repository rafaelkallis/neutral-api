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
  ApiImplicitParam,
  ApiOperation,
  ApiResponse,
  ApiUseTags,
} from '@nestjs/swagger';
import { AuthGuard, AuthUser, UserEntity, ValidationPipe } from '../common';
import { ProjectService } from './project.service';
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
@ApiUseTags('Projects')
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
  @ApiOperation({ title: 'Get a list of projects' })
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
  @ApiOperation({ title: 'Get a project' })
  @ApiImplicitParam({ name: 'id' })
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
  @ApiOperation({ title: 'Update a project' })
  @ApiImplicitParam({ name: 'id' })
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
  @ApiOperation({ title: 'Delete a project' })
  @ApiImplicitParam({ name: 'id' })
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
   * Call to submit reviews over one's project peers.
   */
  @Post('/:id/submit-peer-reviews')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Submit peer reviews' })
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
}
