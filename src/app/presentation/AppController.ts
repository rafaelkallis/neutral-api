import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

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
  public getStatus(): { message: string } {
    return { message: 'service lives!' };
  }
}
