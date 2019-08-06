import { Controller, Get } from '@nestjs/common';
import * as os from 'os';

@Controller()
export class AppController {

  @Get('status')
  getStatus() {
    return {
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      freemem: os.freemem(),
      totalmem: os.totalmem(),
    };
  }
}
