import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddReviewTopicDto {
  @IsString()
  @ApiProperty({
    example: 'Leadership Skills',
    description: 'Title of the review topic',
  })
  public title: string;

  @IsString()
  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the review topic',
  })
  public description: string;

  public constructor(title: string, description: string) {
    this.title = title;
    this.description = description;
  }
}
