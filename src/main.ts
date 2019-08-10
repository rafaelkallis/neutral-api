import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { LogService } from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(LogService));

  const options = new DocumentBuilder()
    .setTitle('Covee SaaS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
// tslint:disable-next-line:no-floating-promises
bootstrap();
