import { Injectable } from '@nestjs/common';
import { UserRepository } from 'user/domain/UserRepository';
import { RefreshDto } from 'auth/application/dto/RefreshDto';
import { SubmitSignupDto } from 'auth/application/dto/SubmitSignupDto';
import { EmailAlreadyUsedException } from 'auth/application/exceptions/EmailAlreadyUsedException';
import { SessionState } from 'shared/session/session-state';
import { TokenManager } from 'shared/token/application/TokenManager';
import { SignupEvent } from 'auth/application/events/SignupEvent';
import { UserDto } from 'user/application/dto/UserDto';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import { User } from 'user/domain/User';
import {
  EventPublisher,
  InjectEventPublisher,
} from 'shared/event/publisher/EventPublisher';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { AuthenticationResponseDto } from 'auth/application/dto/AuthenticationResponseDto';
import { RefreshResponseDto } from 'auth/application/dto/RefreshResponseDto';

@Injectable()
export class AuthService {
  private readonly eventPublisher: EventPublisher;
  private readonly userRepository: UserRepository;
  private readonly tokenService: TokenManager;
  private readonly modelMapper: ObjectMapper;

  public constructor(
    @InjectEventPublisher() eventPublisher: EventPublisher,
    userRepository: UserRepository,
    tokenService: TokenManager,
    modelMapper: ObjectMapper,
  ) {
    this.eventPublisher = eventPublisher;
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.modelMapper = modelMapper;
  }

  /**
   * Passwordless signup token submit
   *
   * The signup token sent to the email address earlier is submitted here
   * along with other information about the user
   */
  public async submitSignup(
    signupToken: string,
    dto: SubmitSignupDto,
    session: SessionState,
  ): Promise<AuthenticationResponseDto> {
    const payload = this.tokenService.validateSignupToken(signupToken);
    const email = Email.from(payload.sub);
    const userExists = await this.userRepository.existsByEmail(email);
    if (userExists) {
      throw new EmailAlreadyUsedException();
    }

    const name = Name.from(dto.firstName, dto.lastName);
    const user = User.create(email, name);
    await this.userRepository.persist(user);
    await this.eventPublisher.publish(
      new SignupEvent(user),
      ...user.getDomainEvents(),
    );

    const sessionToken = this.tokenService.newSessionToken(user.id.value);
    session.set(sessionToken);
    const accessToken = this.tokenService.newAccessToken(user.id.value);
    const refreshToken = this.tokenService.newRefreshToken(user.id.value);
    const userDto: UserDto = this.modelMapper.map(user, UserDto, {
      authUser: user,
    });
    return new AuthenticationResponseDto(accessToken, refreshToken, userDto);
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
