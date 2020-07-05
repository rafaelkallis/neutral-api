import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from 'app/AppModule';
import { Config } from 'shared/config/application/Config';
import { Environment } from 'shared/utility/application/Environment';

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const environment = app.get(Environment);
  const config = app.get(Config);

  app.enableCors({
    origin: config.get('FRONTEND_URL'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const serverUrl = config.get('SERVER_URL');
  const sessionName = config.get('SESSION_NAME');
  const options = new DocumentBuilder()
    .setTitle('Covee Api')
    .setVersion('1.0')
    .addServer(serverUrl)
    .addBearerAuth()
    .addCookieAuth(sessionName)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks();

  const port = config.get('PORT');
  await app.listen(port);

  // hot module replacement (https://docs.nestjs.com/recipes/hot-reload#hot-module-replacement-1)
  if (environment.isDevelopment() && module.hot) {
    module.hot.accept();
    module.hot.dispose(async () => app.close());
  }
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
