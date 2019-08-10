import { IsEmail, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class RequestLoginDto {
  @IsEmail()
  @ApiModelProperty({
    example: 'me@example.com',
    description: 'Email address to send magic login link to',
  })
  email!: string;
}
