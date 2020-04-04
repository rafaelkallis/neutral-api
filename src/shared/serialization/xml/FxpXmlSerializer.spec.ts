import 'reflect-metadata';
import { IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { FxpXmlSerializer } from 'shared/serialization/xml/FxpXmlSerializer';

describe('fast-xml-parser xml serializer', () => {
  let serializer: FxpXmlSerializer;

  beforeEach(() => {
    serializer = new FxpXmlSerializer();
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
    expect(jsonBuf.toString()).toEqual(`<a>test</a><b>123</b><c>true</c>`);

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
    expect(jsonBuf.toString()).toEqual(`<b><a>test</a></b>`);

    const newDto = await serializer.deserialize(MyDto, jsonBuf);
    expect(newDto).toBeInstanceOf(MyDto);
    expect(newDto.b).toBeInstanceOf(MyEmbeddedDto);
    expect(newDto).toEqual(originalDto);
  });
});
