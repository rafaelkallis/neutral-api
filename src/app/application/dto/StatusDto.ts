import { ApiProperty } from '@nestjs/swagger';

export class StatusDto {
  @ApiProperty({ example: 'service lives!' })
  public readonly message: string;

  public constructor(message: string) {
    this.message = message;
  }
}
