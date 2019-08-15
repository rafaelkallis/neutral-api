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
  InsufficientPermissionsException,
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
  private readonly projectRepository: ProjectRepository;
  private readonly randomService: RandomService;

  public constructor(
    projectRepository: ProjectRepository,
    randomService: RandomService,
  ) {
    this.projectRepository = projectRepository;
    this.randomService = randomService;
  }

  /**
   * Get projects
   */
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Get a list of projects' })
  @ApiResponse({ status: 200, description: 'A list of projects' })
  public async getProjects(): Promise<Project[]> {
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
  public async getProject(@Param('id') id: string): Promise<Project> {
    return this.projectRepository.findOneOrFail({ id });
  }

  /**
   * Create a project
   */
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  public async createProject(
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
  public async patchProject(
    @AuthUser() authUser: User,
    @Param('id') id: string,
    @Body(ValidationPipe) patchProjectDto: PatchProjectDto,
  ): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({ id });
    if (project.ownerId !== authUser.id) {
      throw new InsufficientPermissionsException();
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
  public async deleteProject(
    @AuthUser() authUser: User,
    @Param('id') id: string,
  ): Promise<void> {
    const project = await this.projectRepository.findOneOrFail({ id });
    if (project.ownerId !== authUser.id) {
      throw new InsufficientPermissionsException();
    }
    await this.projectRepository.remove(project);
  }
}
