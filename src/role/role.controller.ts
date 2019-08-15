import {
  Get,
  Query,
  Param,
  UseGuards,
  Controller,
  NotImplementedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiImplicitParam,
  ApiImplicitQuery,
  ApiOperation,
  ApiResponse,
  ApiUseTags,
} from '@nestjs/swagger';
import { ValidationPipe, AuthGuard, Role, ProjectRepository, RoleRepository } from '../common';
import { GetRolesQueryDto } from './dto/get-roles-query.dto';

/**
 * Role Controller
 */
@Controller('roles')
@ApiUseTags('Roles')
export class RoleController {
  private readonly projectRepository: ProjectRepository;
  private readonly roleRepository: RoleRepository;

  public constructor(
    projectRepository: ProjectRepository,
    roleRepository: RoleRepository,
  ) {
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
  }

  /**
   * Get roles of a particular project
   */
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiImplicitQuery({ name: 'projectId' })
  @ApiOperation({ title: 'Get a list of roles for a project' })
  @ApiResponse({ status: 200, description: 'A list of roles' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  public async getRoles(@Query(ValidationPipe) queryDto: GetRolesQueryDto): Promise<Role[]> {
    const { projectId } = queryDto;
    await this.projectRepository.findOneOrFail(projectId);
    return this.roleRepository.find({ projectId });
  }

  /**
   * Get the role with the given id
   */
  @Get('/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'id' })
  @ApiOperation({ title: 'Get a role' })
  @ApiResponse({ status: 200, description: 'A roles' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  public async getRole(@Param('id') id: string): Promise<Role> {
    return this.roleRepository.findOneOrFail(id);
  }

  /**
   * Create a role
   */
  public async createRole(): Promise<Role> {
    throw new NotImplementedException();
  }

  /**
   * Update a role
   */
  public async patchRole(): Promise<Role> {
    throw new NotImplementedException();
  }

  /**
   * Delete a role
   */
  public async deleteRole(): Promise<Role> {
    throw new NotImplementedException();
  }
}
