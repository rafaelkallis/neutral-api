import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SubmitSignupDto {
  @IsString()
  @ApiModelProperty({
    example: 'John',
    description: 'First name of the user to sign up',
  })
  firstName!: string;

  @IsString()
  @ApiModelProperty({
    example: 'Doe',
    description: 'Last name of the user to sign up',
  })
  lastName!: string;
}
