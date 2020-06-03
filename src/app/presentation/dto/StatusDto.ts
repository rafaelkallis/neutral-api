import { ApiProperty } from '@nestjs/swagger';

export class StatusDto {
  @ApiProperty({ example: 'service lives!' })
  public readonly message: string;

  @ApiProperty({ example: '979c8dc' })
  public readonly commit: string;

  public constructor(message: string, commit: string) {
    this.message = message;
    this.commit = commit;
  }
}
