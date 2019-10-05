import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
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
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectDto } from './dto/project.dto';

/**
 * Project Controller
 */
@Controller('projects')
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Get a list of projects' })
  @ApiResponse({ status: 200, description: 'A list of projects' })
  public async getProjects(
    @AuthUser() authUser: UserEntity,
  ): Promise<ProjectDto[]> {
    return this.projectService.getProjects(authUser);
  }

  /**
   * Get a project
   */
  @Get(':id')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  public async createProject(
    @AuthUser() authUser: UserEntity,
    @Body(ValidationPipe) dto: CreateProjectDto,
  ): Promise<ProjectDto> {
    return this.projectService.createProject(authUser, dto);
  }

  /**
   * Update a project
   */
  @Patch(':id')
  @UseGuards(AuthGuard)
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
    @Body(ValidationPipe) dto: UpdateProjectDto,
  ): Promise<ProjectDto> {
    return this.projectService.updateProject(authUser, id, dto);
  }

  /**
   * Delete a project
   */
  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
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
   * Get relative contributions of a project
   */
  @Get(':id/relative-contributions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'id' })
  @ApiOperation({ title: 'Get relative contributions of a project' })
  @ApiResponse({ status: 200, description: 'The relative contributions' })
  public async getRelativeContributions(
    @AuthUser() authUser: UserEntity,
    @Param('id') id: string,
  ): Promise<Record<string, number>> {
    return this.projectService.getRelativeContributions(authUser, id);
  }
}
