import { Controller, Get } from '@nestjs/common';

/**
 * App Controller
 */
@Controller()
export class AppController {
  /**
   * Get the status of the app.
   */
  @Get('status')
  public getStatus(): { message: string } {
    return { message: 'service lives!' };
  }
}
