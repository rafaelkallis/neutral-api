import {
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Controller,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ValidationPipe, AuthGuard, AuthUser } from '../common';
import { UserEntity } from '../user';
import { RoleService } from './services/role.service';
import { RoleDto } from './dto/role.dto';
import { GetRolesQueryDto } from './dto/get-roles-query.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignmentDto } from './dto/assignment.dto';

/**
 * Role Controller
 */
@Controller('roles')
@ApiTags('Roles')
export class RoleController {
  private readonly roleService: RoleService;

  public constructor(roleService: RoleService) {
    this.roleService = roleService;
  }

  /**
   * Get roles of a particular project
   */
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'projectId' })
  @ApiOperation({ summary: 'Get a list of roles for a project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'A list of roles' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  public async getRoles(
    @AuthUser() authUser: UserEntity,
    @Query(ValidationPipe) query: GetRolesQueryDto,
  ): Promise<RoleDto[]> {
    return this.roleService.getRoles(authUser, query);
  }

  /**
   * Get the role with the given id
   */
  @Get('/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get a role' })
  @ApiResponse({ status: HttpStatus.OK, description: 'A roles' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' })
  public async getRole(
    @AuthUser() authUser: UserEntity,
    @Param('id') id: string,
  ): Promise<RoleDto> {
    return this.roleService.getRole(authUser, id);
  }

  /**
   * Create a role
   */
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a role' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Role created successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not the project owner',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Assignee not found',
  })
  public async createRole(
    @AuthUser() authUser: UserEntity,
    @Body(ValidationPipe) dto: CreateRoleDto,
  ): Promise<RoleDto> {
    return this.roleService.createRole(authUser, dto);
  }

  /**
   * Update a role
   */
  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role updated succesfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authenticated user is not the role's project owner",
  })
  public async updateRole(
    @AuthUser() authUser: UserEntity,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateRoleDto,
  ): Promise<RoleDto> {
    return this.roleService.updateRole(authUser, id, dto);
  }

  /**
   * Delete a role
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Role deleted succesfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authenticated user is not the role's project owner",
  })
  public async deleteRole(
    @AuthUser() authUser: UserEntity,
    @Param('id') id: string,
  ): Promise<void> {
    return this.roleService.deleteRole(authUser, id);
  }

  /**
   * Assign user to a role
   */
  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a user to a role' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role updated succesfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authenticated user is not the role's project owner",
  })
  public async assignUser(
    @AuthUser() authUser: UserEntity,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: AssignmentDto,
  ): Promise<RoleDto> {
    return this.roleService.assignUser(authUser, id, dto);
  }
}
