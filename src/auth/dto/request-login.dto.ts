import { ApiModelProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestLoginDto {
  @IsEmail()
  @ApiModelProperty({
    example: 'me@example.com',
    description: 'Email address to send magic login link to',
  })
  email!: string;
}
