import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

interface RequestLoginDtoOptions {
  email: string;
}

/**
 * Request Login DTO
 */
export class RequestLoginDto {
  @IsEmail()
  @ApiProperty({
    example: 'me@example.com',
    description: 'Email address to send magic login link to',
  })
  public email!: string;

  private constructor() {}

  public static from({ email }: RequestLoginDtoOptions): RequestLoginDto {
    const dto = new RequestLoginDto();
    dto.email = email;
    return dto;
  }
}
