import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { StatusDto } from 'app/application/dto/StatusDto';

/**
 * App Controller
 */
@Controller()
@ApiTags('App')
export class AppController {
  /**
   * Get the status of the app.
   */
  @Get('status')
  @ApiOperation({ summary: "Get the App's status" })
  @ApiOkResponse({ description: "The App's status", type: StatusDto })
  public getStatus(): StatusDto {
    const message = 'service lives!';
    return new StatusDto(message);
  }
}
