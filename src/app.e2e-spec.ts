import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from './app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  test('should be defined', async () => {
    expect(app).toBeDefined();
  });

  test('/status (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/status');
    expect(response.status).toBe(200);
  });
});
