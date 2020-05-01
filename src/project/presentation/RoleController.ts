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
import { AddRoleDto } from 'project/application/dto/AddRoleDto';
import { UpdateRoleDto } from 'project/application/dto/UpdateRoleDto';
import { AssignmentDto } from 'project/application/dto/AssignmentDto';
import { ProjectApplicationService } from 'project/application/ProjectApplicationService';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { Mediator } from 'shared/mediator/Mediator';
import { AddRoleCommand } from 'project/application/commands/AddRole';
import { UpdateRoleCommand } from 'project/application/commands/UpdateRole';

/**
 * Role Controller
 */
@Controller('projects/:project_id/roles')
@UseGuards(AuthGuard)
@ApiTags('Projects')
export class RoleController {
  private readonly projectApplication: ProjectApplicationService;
  private readonly mediator: Mediator;

  public constructor(
    projectApplication: ProjectApplicationService,
    mediator: Mediator,
  ) {
    this.projectApplication = projectApplication;
    this.mediator = mediator;
  }

  /**
   * Create a role
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'addRole', summary: 'Add a role' })
  @ApiCreatedResponse({
    description: 'Role added successfully',
    type: ProjectDto,
  })
  @ApiForbiddenResponse({ description: 'User is not the project creator' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiNotFoundResponse({ description: 'Assignee not found' })
  public async addRole(
    @AuthUser() authUser: User,
    @Param('project_id') projectId: string,
    @Body(ValidationPipe) addRoleDto: AddRoleDto,
  ): Promise<ProjectDto> {
    return this.mediator.send(
      new AddRoleCommand(
        authUser,
        projectId,
        addRoleDto.title,
        addRoleDto.description,
      ),
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
    @Body(ValidationPipe) updateRoleDto: UpdateRoleDto,
  ): Promise<ProjectDto> {
    return this.mediator.send(
      new UpdateRoleCommand(
        authUser,
        projectId,
        roleId,
        updateRoleDto.title,
        updateRoleDto.description,
      ),
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
    operationId: 'assignUserToRole',
    summary: 'Assign a user to a role',
  })
  @ApiOkResponse({ description: 'Role updated succesfully', type: ProjectDto })
  @ApiForbiddenResponse({
    description: "Authenticated user is not the role's project owner",
  })
  public async assignUserToRole(
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

  /**
   * Unassign a role
   */
  @Post(':role_id/unassign')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'unassignRole',
    summary: 'Unassign a role',
  })
  @ApiOkResponse({
    description: 'Role unassigned succesfully',
    type: ProjectDto,
  })
  @ApiForbiddenResponse({
    description: "Authenticated user is not the role's project owner",
  })
  public async unassignRole(
    @AuthUser() authUser: User,
    @Param('project_id') projectId: string,
    @Param('role_id') roleId: string,
  ): Promise<ProjectDto> {
    return this.projectApplication.unassignRole(authUser, projectId, roleId);
  }
}
