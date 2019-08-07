import {
  Controller,
  Get,
  Post,
  Patch,
  UseGuards,
  Body,
  Param,
  ValidationPipe,
  NotImplementedException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUseTags,
  ApiBearerAuth,
  ApiImplicitParam,
} from '@nestjs/swagger';

import {
  AuthGuard,
  AuthUser,
  User,
  Project,
  ProjectRepository,
  ProjectNotFoundException,
  RandomService,
  NotResourceOwnerException,
} from '../common';
import { CreateProjectDto } from './dto/create-project.dto';
import { PatchProjectDto } from './dto/patch-project.dto';

@Controller('projects')
@ApiUseTags('Projects')
export class ProjectController {
  constructor(
    private projectRepository: ProjectRepository,
    private randomService: RandomService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Get a list of projects' })
  @ApiResponse({ status: 200, description: 'A list of projects' })
  async getProjects(): Promise<Project[]> {
    return this.projectRepository.find();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Get a project' })
  @ApiImplicitParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'The requested project' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProject(@Param('id') id: string): Promise<Project> {
    return this.projectRepository.findOneOrFailWith(
      { id },
      new ProjectNotFoundException(),
    );
  }

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

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Update a project' })
  @ApiImplicitParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Project update succesfully' })
  @ApiResponse({ status: 403, description: 'Authenticated user is not the project owner' })
  async patchProject(
    @AuthUser() authUser: User,
    @Param('id') id: string,
    @Body(ValidationPipe) patchProjectDto: PatchProjectDto,
  ): Promise<Project> {
    const project = await this.projectRepository.findOneOrFailWith(
      { id },
      new ProjectNotFoundException(),
    );
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

  async deleteProject(authUser: User, id: string): Promise<void> {
    throw new NotImplementedException();
  }
}
