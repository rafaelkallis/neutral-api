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
import { ValidationPipe } from 'common';
import { UserModel } from 'user';
import { RoleDto } from 'project/application/dto/RoleDto';
import { GetRolesQueryDto } from 'project/application/GetRolesQueryDto';
import { CreateRoleDto } from 'project/application/dto/CreateRoleDto';
import { UpdateRoleDto } from 'project/application/dto/UpdateRoleDto';
import { AssignmentDto } from 'project/application/dto/AssignmentDto';
import { AuthUser, AuthGuard } from 'auth';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';

/**
 * Role Controller
 */
@Controller('roles')
@UseGuards(AuthGuard)
@ApiTags('Roles')
export class RoleController {
  private readonly projectApplication: ProjectApplicationService;

  public constructor(projectApplication: ProjectApplicationService) {
    this.projectApplication = projectApplication;
  }

  /**
   * Get roles of a particular project
   */
  @Get()
  @ApiBearerAuth()
  @ApiQuery({ name: 'projectId' })
  @ApiOperation({ summary: 'Get a list of roles for a project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'A list of roles' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  public async getRoles(
    @AuthUser() authUser: UserModel,
    @Query(ValidationPipe) query: GetRolesQueryDto,
  ): Promise<RoleDto[]> {
    return this.projectApplication.getRoles(authUser, query);
  }

  /**
   * Get the role with the given id
   */
  @Get('/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get a role' })
  @ApiResponse({ status: HttpStatus.OK, description: 'A roles' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' })
  public async getRole(
    @AuthUser() authUser: UserModel,
    @Param('id') id: string,
  ): Promise<RoleDto> {
    return this.projectApplication.getRole(authUser, id);
  }

  /**
   * Create a role
   */
  @Post()
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
    @AuthUser() authUser: UserModel,
    @Body(ValidationPipe) dto: CreateRoleDto,
  ): Promise<RoleDto> {
    const { projectId, title, description } = dto;
    return this.projectApplication.addRole(
      authUser,
      projectId,
      title,
      description,
    );
  }

  /**
   * Update a role
   */
  @Patch(':id')
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
    @AuthUser() authUser: UserModel,
    @Param('id') roleId: string,
    @Body(ValidationPipe) dto: UpdateRoleDto,
  ): Promise<RoleDto> {
    const { title, description } = dto;
    return this.projectApplication.updateRole(
      authUser,
      roleId,
      title,
      description,
    );
  }

  /**
   * Delete a role
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
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
    @AuthUser() authUser: UserModel,
    @Param('id') roleId: string,
  ): Promise<void> {
    return this.projectApplication.removeRole(authUser, roleId);
  }

  /**
   * Assign user to a role
   */
  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
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
    @AuthUser() authUser: UserModel,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: AssignmentDto,
  ): Promise<RoleDto> {
    return this.projectApplication.assignUserToRole(
      authUser,
      id,
      dto.assigneeId,
      dto.assigneeEmail,
    );
  }
}
