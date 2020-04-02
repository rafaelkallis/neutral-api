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
  ApiQuery,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { ValidationPipe } from 'shared/application/pipes/ValidationPipe';
import { AuthGuard, AuthUser } from 'auth/application/guards/AuthGuard';
import { User } from 'user/domain/User';
import { RoleDto } from 'project/application/dto/RoleDto';
import { GetRolesQueryDto } from 'project/application/dto/GetRolesQueryDto';
import { CreateRoleDto } from 'project/application/dto/CreateRoleDto';
import { UpdateRoleDto } from 'project/application/dto/UpdateRoleDto';
import { AssignmentDto } from 'project/application/dto/AssignmentDto';
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
  @ApiOkResponse({ description: 'A list of roles', type: [RoleDto] })
  @ApiNotFoundResponse({ description: 'Project not found' })
  public async getRoles(
    @AuthUser() authUser: User,
    @Query(ValidationPipe) query: GetRolesQueryDto,
  ): Promise<RoleDto[]> {
    return this.projectApplication.getRoles(authUser, query);
  }

  /**
   * Get the role with the given id
   */
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a role' })
  @ApiOkResponse({ description: 'A role', type: RoleDto })
  @ApiNotFoundResponse({ description: 'Role not found' })
  public async getRole(
    @AuthUser() authUser: User,
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
  @ApiCreatedResponse({
    description: 'Role created successfully',
    type: RoleDto,
  })
  @ApiForbiddenResponse({ description: 'User is not the project owner' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiNotFoundResponse({ description: 'Assignee not found' })
  public async createRole(
    @AuthUser() authUser: User,
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
  @ApiOkResponse({ description: 'Role updated succesfully', type: RoleDto })
  @ApiForbiddenResponse({
    description: "Authenticated user is not the role's project owner",
  })
  public async updateRole(
    @AuthUser() authUser: User,
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
  @ApiNoContentResponse({ description: 'Role deleted succesfully' })
  @ApiForbiddenResponse({
    description: "Authenticated user is not the role's project owner",
  })
  public async deleteRole(
    @AuthUser() authUser: User,
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
  @ApiOkResponse({ description: 'Role updated succesfully', type: RoleDto })
  @ApiForbiddenResponse({
    description: "Authenticated user is not the role's project owner",
  })
  public async assignUser(
    @AuthUser() authUser: User,
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
