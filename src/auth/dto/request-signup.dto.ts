import { ApiModelProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestSignupDto {
  @IsEmail()
  @ApiModelProperty({
    example: 'me@example.com',
    description: 'Email address to send the magic signup link to',
  })
  email!: string;
}
