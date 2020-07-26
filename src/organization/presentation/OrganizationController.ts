import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'auth/application/guards/AuthGuard';

/**
 * Organization Controller
 */
@Controller('organizations')
@ApiTags('Organizations')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class OrganizationController {}
