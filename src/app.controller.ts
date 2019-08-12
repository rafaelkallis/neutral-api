import { Controller, Get } from '@nestjs/common';
import * as os from 'os';

/**
 * App Controller
 */
@Controller()
export class AppController {
  /**
   * Get the status of the app.
   */
  @Get('status')
  public getStatus(): GetStatusResponse {
    return {
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      freemem: os.freemem(),
      totalmem: os.totalmem(),
    };
  }
}

interface GetStatusResponse {
  uptime: number;
  loadavg: number[];
  freemem: number;
  totalmem: number;
}
