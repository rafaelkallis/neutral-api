import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

/**
 * Request Signup DTO
 */
export class RequestSignupDto {
  @IsEmail(undefined, { message: 'The provided email is not valid.' })
  @ApiProperty({
    example: 'me@example.com',
    description: 'Email address to send the magic signup link to',
  })
  public email: string;

  public constructor(email: string) {
    this.email = email;
  }
}
