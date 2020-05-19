import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateReviewTopicDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Punctuality',
    description: 'Title of the review topic',
    required: false,
  })
  public title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example:
      'Completing a required task or fulfilling an obligation before or at a previously designated time.',
    description: 'Description of the review topic',
    required: false,
  })
  public description?: string;

  public constructor(title?: string, description?: string) {
    this.title = title;
    this.description = description;
  }
}
