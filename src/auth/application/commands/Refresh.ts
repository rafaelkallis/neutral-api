import { Command } from 'shared/command/Command';
import {
  AbstractCommandHandler,
  CommandHandler,
} from 'shared/command/CommandHandler';
import { TokenManager } from 'shared/token/application/TokenManager';
import { RefreshResponseDto } from 'auth/application/dto/RefreshResponseDto';

/**
 * Refresh the session
 *
 * A new access token is assigned to the session and sent back to the
 * response body.
 */
export class RefreshCommand extends Command<RefreshResponseDto> {
  public readonly refreshToken: string;

  public constructor(refreshToken: string) {
    super();
    this.refreshToken = refreshToken;
  }
}

@CommandHandler(RefreshCommand)
export class RefreshCommandHandler extends AbstractCommandHandler<
  RefreshResponseDto,
  RefreshCommand
> {
  private readonly tokenManager: TokenManager;

  public constructor(tokenManager: TokenManager) {
    super();
    this.tokenManager = tokenManager;
  }

  public handle(command: RefreshCommand): RefreshResponseDto {
    const payload = this.tokenManager.validateRefreshToken(
      command.refreshToken,
    );
    const accessToken = this.tokenManager.newAccessToken(payload.sub);
    return new RefreshResponseDto(accessToken);
  }
}
