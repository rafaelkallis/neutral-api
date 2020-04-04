import 'reflect-metadata';
import { NativeJsonSerializer } from 'shared/serialization/json/NativeJsonSerializer';
import { IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

describe('native json serializer', () => {
  let serializer: NativeJsonSerializer;

  beforeEach(() => {
    serializer = new NativeJsonSerializer();
  });

  test('primitives', async () => {
    class MyDto {
      @IsString()
      a: string;
      @IsNumber()
      b: number;
      @IsBoolean()
      c: boolean;

      constructor(a: string, b: number, c: boolean) {
        this.a = a;
        this.b = b;
        this.c = c;
      }
    }

    const originalDto = new MyDto('test', 123, true);
    const jsonBuf = await serializer.serialize(originalDto);
    expect(jsonBuf.toString()).toEqual(`{"a":"test","b":123,"c":true}`);

    const newDto = await serializer.deserialize(MyDto, jsonBuf);
    expect(newDto).toBeInstanceOf(MyDto);
    expect(newDto).toEqual(originalDto);
  });

  test('embedded types', async () => {
    class MyEmbeddedDto {
      @IsString()
      a: string;
      constructor(a: string) {
        this.a = a;
      }
    }
    class MyDto {
      @Type(() => MyEmbeddedDto)
      b: MyEmbeddedDto;

      constructor(b: MyEmbeddedDto) {
        this.b = b;
      }
    }

    const originalDto = new MyDto(new MyEmbeddedDto('test'));
    const jsonBuf = await serializer.serialize(originalDto);
    expect(jsonBuf.toString()).toEqual(`{"b":{"a":"test"}}`);

    const newDto = await serializer.deserialize(MyDto, jsonBuf);
    expect(newDto).toBeInstanceOf(MyDto);
    expect(newDto.b).toBeInstanceOf(MyEmbeddedDto);
    expect(newDto).toEqual(originalDto);
  });
});
