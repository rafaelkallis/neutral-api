import { IsEmail } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class RequestSignupDto {
  @IsEmail()
  @ApiModelProperty({
    example: 'me@example.com',
    description: 'Email address to send the magic signup link to',
  })
  readonly email: string;
}
