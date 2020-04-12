import { Injectable } from '@nestjs/common';
import { SessionState } from 'shared/session/session-state';

@Injectable()
export class AuthService {
  /**
   * Logout
   */
  public async logout(session: SessionState): Promise<void> {
    session.clear();
  }
}
