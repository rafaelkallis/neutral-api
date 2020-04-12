import { Injectable } from '@nestjs/common';
import { RefreshDto } from 'auth/application/dto/RefreshDto';
import { SessionState } from 'shared/session/session-state';
import { TokenManager } from 'shared/token/application/TokenManager';
import { RefreshResponseDto } from 'auth/application/dto/RefreshResponseDto';

@Injectable()
export class AuthService {
  private readonly tokenService: TokenManager;

  public constructor(tokenService: TokenManager) {
    this.tokenService = tokenService;
  }

  /**
   * Refresh the session
   *
   * A new access token is assigned to the session and sent back to the
   * response body.
   */
  public refresh(dto: RefreshDto): RefreshResponseDto {
    const payload = this.tokenService.validateRefreshToken(dto.refreshToken);
    const accessToken = this.tokenService.newAccessToken(payload.sub);
    return new RefreshResponseDto(accessToken);
  }

  /**
   * Logout
   */
  public async logout(session: SessionState): Promise<void> {
    session.clear();
  }
}
