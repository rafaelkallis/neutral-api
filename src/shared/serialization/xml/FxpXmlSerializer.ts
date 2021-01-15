import { Type } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { XmlSerializer } from 'shared/serialization/xml/XmlSerializer';
import { parse, j2xParser } from 'fast-xml-parser';

export class FxpXmlSerializer extends XmlSerializer {
  public async serialize<T extends object>(obj: T): Promise<Buffer> {
    await validate(obj);
    const plain = classToPlain(obj);
    const xmlStr = new j2xParser({}).parse(plain);
    const xmlBuf = Buffer.from(xmlStr);
    return xmlBuf;
  }

  public async deserialize<T extends object>(
    type: Type<T>,
    xmlBuf: Buffer,
  ): Promise<T> {
    const xmlStr = xmlBuf.toString();
    const plain = parse(xmlStr);
    const obj = plainToClass(type, plain);
    await validate(obj);
    return obj;
  }
}
