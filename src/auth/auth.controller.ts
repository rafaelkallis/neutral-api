import {
  Controller,
  Post,
  HttpCode,
  Body,
  Param,
  ValidationPipe,
} from '@nestjs/common';
import { RequestLoginDto, RequestSignupDto, SubmitSignupDto } from './dto';
import { AuthService } from './auth.service';
import { ApiImplicitParam, ApiUseTags } from '@nestjs/swagger';

@Controller('auth')
@ApiUseTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async requestLoginToken(@Body(ValidationPipe) dto: RequestLoginDto) {
    await this.authService.requestLoginToken(dto);
  }

  @Post('login/:token')
  @HttpCode(200)
  @ApiImplicitParam({ name: 'token' })
  async submitLoginToken(@Param('token') loginToken) {
    const {
      accessToken,
      refreshToken,
    } = await this.authService.submitLoginToken(loginToken);
    return { accessToken, refreshToken };
  }

  @Post('signup')
  @HttpCode(200)
  async requestSignupToken(@Body(ValidationPipe) dto: RequestSignupDto) {
    await this.authService.requestSignupToken(dto);
  }

  @Post('signup/:token')
  @ApiImplicitParam({ name: 'token' })
  async submitSignupToken(
    @Param('token') signupToken,
    @Body(ValidationPipe) dto: SubmitSignupDto,
  ) {
    await this.authService.submitSignupToken(signupToken, dto);
  }
}
