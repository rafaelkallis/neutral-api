import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

interface SubmitSignupDtoOptions {
  firstName: string;
  lastName: string;
}

/**
 * Submit Signup DTO
 */
export class SubmitSignupDto {
  @IsString()
  @ApiProperty({
    example: 'John',
    description: 'First name of the user to sign up',
  })
  public firstName!: string;

  @IsString()
  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user to sign up',
  })
  public lastName!: string;

  private constructor() {}

  public static from({
    firstName,
    lastName,
  }: SubmitSignupDtoOptions): SubmitSignupDto {
    const dto = new SubmitSignupDto();
    dto.firstName = firstName;
    dto.lastName = lastName;
    return dto;
  }
}
