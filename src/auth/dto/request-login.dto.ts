import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

/**
 * Request Login DTO
 */
export class RequestLoginDto {
  @IsEmail()
  @ApiProperty({
    example: 'me@example.com',
    description: 'Email address to send magic login link to',
  })
  public email: string;

  public constructor(email: string) {
    this.email = email;
  }
}
