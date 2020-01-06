import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from 'app.module';
import { LogService } from 'common';
import { CONFIG, Config } from 'config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logService = app.get(LogService);
  const config = app.get<Config>(CONFIG);

  app.useLogger(logService);

  app.enableCors({
    origin: config.get('FRONTEND_URL'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const options = new DocumentBuilder()
    .setTitle('Covee SaaS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks();

  await app.listen(config.get('PORT'));
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
