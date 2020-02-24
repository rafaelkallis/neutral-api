import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from 'app/AppModule';
import { Config, CONFIG } from 'config/application/Config';

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<Config>(CONFIG);

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

  const port = config.get('PORT');
  await app.listen(port);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
