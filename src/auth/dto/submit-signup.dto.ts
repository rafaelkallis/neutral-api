import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Submit Signup DTO
 */
export class SubmitSignupDto {
  @IsString()
  @ApiProperty({
    example: 'John',
    description: 'First name of the user to sign up',
  })
  public firstName: string;

  @IsString()
  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user to sign up',
  })
  public lastName: string;

  public constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
