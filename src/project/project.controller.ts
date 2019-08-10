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

import {
  AuthGuard,
  AuthUser,
  NotResourceOwnerException,
  Project,
  ProjectRepository,
  RandomService,
  User,
  ValidationPipe,
} from '../common';

import { CreateProjectDto } from './dto/create-project.dto';
import { PatchProjectDto } from './dto/patch-project.dto';

/**
 * Project Controller
 */
@Controller('projects')
@ApiUseTags('Projects')
export class ProjectController {
  constructor(
    private projectRepository: ProjectRepository,
    private randomService: RandomService,
  ) {}

  /**
   * Get projects
   */
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Get a list of projects' })
  @ApiResponse({ status: 200, description: 'A list of projects' })
  async getProjects(): Promise<Project[]> {
    return this.projectRepository.find();
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
  async getProject(@Param('id') id: string): Promise<Project> {
    return this.projectRepository.findOneOrFail({ id });
  }

  /**
   * Create a project
   */
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async createProject(
    @AuthUser() authUser: User,
    @Body(ValidationPipe) dto: CreateProjectDto,
  ): Promise<Project> {
    const project = new Project();
    project.id = this.randomService.id();
    project.ownerId = authUser.id;
    project.title = dto.title;
    project.description = dto.description;
    return this.projectRepository.save(project);
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
  async patchProject(
    @AuthUser() authUser: User,
    @Param('id') id: string,
    @Body(ValidationPipe) patchProjectDto: PatchProjectDto,
  ): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({ id });
    if (project.ownerId !== authUser.id) {
      throw new NotResourceOwnerException();
    }
    if (patchProjectDto.title) {
      project.title = patchProjectDto.title;
    }
    if (patchProjectDto.description) {
      project.description = patchProjectDto.description;
    }
    return this.projectRepository.save(project);
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
  async deleteProject(
    @AuthUser() authUser: User,
    @Param('id') id: string,
  ): Promise<void> {
    const project = await this.projectRepository.findOneOrFail({ id });
    if (project.ownerId !== authUser.id) {
      throw new NotResourceOwnerException();
    }
    await this.projectRepository.remove(project);
  }
}
