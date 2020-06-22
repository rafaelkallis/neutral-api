import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateNested } from 'class-validator';
import {
  ReviewTopicInputDto,
  ContinuousReviewTopicInputDto,
  DiscreteReviewTopicInputDto,
} from '../../application/dto/ReviewTopicInputDto';
import { Type } from 'class-transformer';

export class AddReviewTopicDto {
  @IsString()
  @ApiProperty({
    example: 'Leadership Skills',
    description: 'Title of the review topic',
  })
  public readonly title: string;

  @IsString()
  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the review topic',
  })
  public readonly description: string;

  @ValidateNested()
  @Type(() => ReviewTopicInputDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { name: 'continuous', value: ContinuousReviewTopicInputDto },
        { name: 'discrete', value: DiscreteReviewTopicInputDto },
      ],
    },
  })
  @ApiProperty()
  public readonly input: ReviewTopicInputDto;

  public constructor(
    title: string,
    description: string,
    // TODO remove default value once frontend catches up
    input: ReviewTopicInputDto = new ContinuousReviewTopicInputDto(0, 100),
  ) {
    this.title = title;
    this.description = description;
    this.input = input;
  }
}
