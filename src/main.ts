import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from 'app/AppModule';
import { Config } from 'shared/config/application/Config';

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(Config);

  app.enableCors({
    origin: config.get('FRONTEND_URL'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const serverUrl = config.get('SERVER_URL');
  const sessionName = config.get('SESSION_NAME');
  const options = new DocumentBuilder()
    .setTitle('Covee SaaS Api')
    .setVersion('1.0')
    .addServer(serverUrl)
    .addBearerAuth()
    .addSecurity('cookie', { type: 'apiKey', in: 'cookie', name: sessionName })
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks();

  const port = config.get('PORT');
  await app.listen(port);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
