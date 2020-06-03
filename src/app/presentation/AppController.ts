import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { StatusDto } from 'app/presentation/dto/StatusDto';
import { PongDto } from 'app/presentation/dto/PongDto';
import { Config } from 'shared/config/application/Config';

/**
 * App Controller
 */
@Controller()
@ApiTags('App')
export class AppController {
  private readonly config: Config;

  public constructor(config: Config) {
    this.config = config;
  }

  /**
   * Ping the app.
   */
  @Get()
  @ApiOperation({ operationId: 'ping', summary: 'Ping the app' })
  @ApiOkResponse({ description: 'pong', type: PongDto })
  public ping(): PongDto {
    return new PongDto();
  }

  /**
   * Get the status of the app.
   */
  @Get('status')
  @ApiOperation({ operationId: 'getStatus', summary: "Get the App's status" })
  @ApiOkResponse({ description: "The App's status", type: StatusDto })
  public getStatus(): StatusDto {
    const message = 'service lives!';
    return new StatusDto(message, this.config.commit);
  }
}
