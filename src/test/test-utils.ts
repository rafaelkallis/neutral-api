import { Injectable } from '@nestjs/common';

@Injectable()
export class TestUtils {
  public async sleep(millis: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, millis));
  }
}
