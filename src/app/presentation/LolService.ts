import { Injectable } from '@nestjs/common';

@Injectable()
export class LolService {
  public foo(): void {
    console.log('hello world');
  }
}
