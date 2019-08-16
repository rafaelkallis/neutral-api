import {
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Controller,
  HttpCode,
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
import {
  ValidationPipe,
  AuthGuard,
  AuthUser,
  User,
  Role,
  UserRepository,
  ProjectRepository,
  RoleRepository,
  InsufficientPermissionsException,
  RandomService,
} from '../common';
import { GetRolesQueryDto } from './dto/get-roles-query.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { PatchRoleDto } from './dto/patch-role.dto';
import { ProjectOwnerAssignmentException } from './exceptions/project-owner-assignment.exception';

/**
 * Role Controller
 */
@Controller('roles')
@ApiUseTags('Roles')
export class RoleController {
  private readonly userRepository: UserRepository;
  private readonly projectRepository: ProjectRepository;
  private readonly roleRepository: RoleRepository;
  private readonly randomService: RandomService;

  public constructor(
    userRepository: UserRepository,
    projectRepository: ProjectRepository,
    roleRepository: RoleRepository,
    randomService: RandomService,
  ) {
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
    this.randomService = randomService;
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
  public async getRoles(
    @Query(ValidationPipe) queryDto: GetRolesQueryDto,
  ): Promise<Role[]> {
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
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Create a role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 403, description: 'User is not the project owner' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 404, description: 'Assignee not found' })
  public async createRole(
    @AuthUser() authUser: User,
    @Body(ValidationPipe) dto: CreateRoleDto,
  ): Promise<Role> {
    const project = await this.projectRepository.findOneOrFail({
      id: dto.projectId,
    });
    if (project.ownerId !== authUser.id) {
      throw new InsufficientPermissionsException();
    }
    if (dto.assigneeId) {
      if (dto.assigneeId === authUser.id) {
        throw new ProjectOwnerAssignmentException();
      }
      await this.userRepository.findOneOrFail({ id: dto.assigneeId });
    }
    const role = new Role();
    role.id = this.randomService.id();
    role.projectId = dto.projectId;
    role.assigneeId = dto.assigneeId || null;
    role.title = dto.title;
    role.description = dto.description;
    return this.roleRepository.save(role);
  }

  /**
   * Update a role
   */
  public async patchRole(authUser: User, id: string, dto: PatchRoleDto): Promise<Role> {
    const role = await this.roleRepository.findOneOrFail({ id });
    const project = await this.projectRepository.findOneOrFail({
      id: role.projectId,
    });
    if (project.ownerId !== authUser.id) {
      throw new InsufficientPermissionsException();
    }
    if (dto.assigneeId && dto.assigneeId !== role.assigneeId) {
      await this.userRepository.findOneOrFail({ id: dto.assigneeId });
    }
    Object.assign(role, dto);
    return this.roleRepository.save(role);
  }

  /**
   * Delete a role
   */
  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Delete a role' })
  @ApiImplicitParam({ name: 'id' })
  @ApiResponse({ status: 204, description: 'Role deleted succesfully' })
  @ApiResponse({
    status: 403,
    description: "Authenticated user is not the role's project owner",
  })
  public async deleteRole(
    @AuthUser() authUser: User,
    @Param('id') id: string,
  ): Promise<void> {
    const role = await this.roleRepository.findOneOrFail({ id });
    const project = await this.projectRepository.findOneOrFail({
      id: role.projectId,
    });
    if (project.ownerId !== authUser.id) {
      throw new InsufficientPermissionsException();
    }
    await this.roleRepository.remove(role);
  }
}
