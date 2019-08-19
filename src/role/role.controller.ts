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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiImplicitParam,
  ApiImplicitQuery,
  ApiOperation,
  ApiResponse,
  ApiUseTags,
} from '@nestjs/swagger';
import { ValidationPipe, AuthGuard, AuthUser, User, Role } from '../common';
import { RoleService } from './role.service';
import { GetRolesQueryDto } from './dto/get-roles-query.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SubmitPeerReviewsDto } from './dto/submit-peer-reviews.dto';

/**
 * Role Controller
 */
@Controller('roles')
@ApiUseTags('Roles')
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
  @ApiImplicitQuery({ name: 'projectId' })
  @ApiOperation({ title: 'Get a list of roles for a project' })
  @ApiResponse({ status: 200, description: 'A list of roles' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  public async getRoles(
    @Query(ValidationPipe) dto: GetRolesQueryDto,
  ): Promise<Role[]> {
    return this.roleService.getRoles(dto);
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
    return this.roleService.getRole(id);
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
    return this.roleService.createRole(authUser, dto);
  }

  /**
   * Update a role
   */
  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Update a role' })
  @ApiImplicitParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Role updated succesfully' })
  @ApiResponse({
    status: 403,
    description: "Authenticated user is not the role's project owner",
  })
  public async updateRole(
    @AuthUser() authUser: User,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateRoleDto,
  ): Promise<Role> {
    return this.roleService.updateRole(authUser, id, dto);
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
    return this.roleService.deleteRole(authUser, id);
  }

  /**
   * Call to submit reviews over one's project peers.
   */
  @Post('/:id/submit-peer-reviews')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Submit peer reviews' })
  @ApiImplicitParam({ name: 'id' })
  @ApiResponse({
    status: 200,
    description: 'Peer reviews submitted successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid peer reviews' })
  public async submitPeerReviews(
    @AuthUser() authUser: User,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: SubmitPeerReviewsDto,
  ): Promise<void> {
    return this.roleService.submitPeerReviews(authUser, id, dto);
  }
}
