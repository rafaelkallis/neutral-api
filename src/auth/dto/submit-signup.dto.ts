import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Submit Signup DTO
 */
export class SubmitSignupDto {
  @IsString()
  @ApiModelProperty({
    example: 'John',
    description: 'First name of the user to sign up',
  })
  public firstName!: string;

  @IsString()
  @ApiModelProperty({
    example: 'Doe',
    description: 'Last name of the user to sign up',
  })
  public lastName!: string;
}
