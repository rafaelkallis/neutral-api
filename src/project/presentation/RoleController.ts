import {
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Controller,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ValidationPipe } from 'shared/application/pipes/ValidationPipe';
import { AuthGuard, AuthUser } from 'auth/application/guards/AuthGuard';
import { User } from 'user/domain/User';
import { CreateRoleDto } from 'project/application/dto/CreateRoleDto';
import { UpdateRoleDto } from 'project/application/dto/UpdateRoleDto';
import { AssignmentDto } from 'project/application/dto/AssignmentDto';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import { ProjectDto } from 'project/application/dto/ProjectDto';

/**
 * Role Controller
 */
@Controller('projects/:project_id/roles')
@UseGuards(AuthGuard)
@ApiTags('Projects')
export class RoleController {
  private readonly projectApplication: ProjectApplicationService;

  public constructor(projectApplication: ProjectApplicationService) {
    this.projectApplication = projectApplication;
  }

  /**
   * Create a role
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'createRole', summary: 'Create a role' })
  @ApiCreatedResponse({
    description: 'Role created successfully',
    type: ProjectDto,
  })
  @ApiForbiddenResponse({ description: 'User is not the project creator' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiNotFoundResponse({ description: 'Assignee not found' })
  public async createRole(
    @AuthUser() authUser: User,
    @Param('project_id') projectId: string,
    @Body(ValidationPipe) dto: CreateRoleDto,
  ): Promise<ProjectDto> {
    const { title, description } = dto;
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
  @Patch(':role_id')
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'updateRole', summary: 'Update a role' })
  @ApiOkResponse({ description: 'Role updated succesfully', type: ProjectDto })
  @ApiForbiddenResponse({
    description: "Authenticated user is not the role's project owner",
  })
  public async updateRole(
    @AuthUser() authUser: User,
    @Param('project_id') projectId: string,
    @Param('role_id') roleId: string,
    @Body(ValidationPipe) dto: UpdateRoleDto,
  ): Promise<ProjectDto> {
    const { title, description } = dto;
    return this.projectApplication.updateRole(
      authUser,
      projectId,
      roleId,
      title,
      description,
    );
  }

  /**
   * Delete a role
   */
  @Delete(':role_id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'deleteRole', summary: 'Delete a role' })
  @ApiOkResponse({ description: 'Role deleted succesfully', type: ProjectDto })
  @ApiForbiddenResponse({
    description: "Authenticated user is not the role's project owner",
  })
  public async deleteRole(
    @AuthUser() authUser: User,
    @Param('project_id') projectId: string,
    @Param('role_id') roleId: string,
  ): Promise<ProjectDto> {
    return this.projectApplication.removeRole(authUser, projectId, roleId);
  }

  /**
   * Assign user to a role
   */
  @Post(':role_id/assign')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'assignUser',
    summary: 'Assign a user to a role',
  })
  @ApiOkResponse({ description: 'Role updated succesfully', type: ProjectDto })
  @ApiForbiddenResponse({
    description: "Authenticated user is not the role's project owner",
  })
  public async assignUser(
    @AuthUser() authUser: User,
    @Param('project_id') projectId: string,
    @Param('role_id') roleId: string,
    @Body(ValidationPipe) dto: AssignmentDto,
  ): Promise<ProjectDto> {
    return this.projectApplication.assignUserToRole(
      authUser,
      projectId,
      roleId,
      dto.assigneeId,
      dto.assigneeEmail,
    );
  }
}
