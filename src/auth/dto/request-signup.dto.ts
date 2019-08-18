import { ApiModelProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

interface RequestSignupDtoOptions {
  email: string;
}

/**
 * Request Signup DTO
 */
export class RequestSignupDto {
  @IsEmail()
  @ApiModelProperty({
    example: 'me@example.com',
    description: 'Email address to send the magic signup link to',
  })
  public email!: string;

  private constructor() {}

  public static from({ email }: RequestSignupDtoOptions): RequestSignupDto {
    const dto = new RequestSignupDto();
    dto.email = email;
    return dto;
  }
}
