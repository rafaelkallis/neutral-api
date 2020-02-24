import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../AppModule';

describe('app (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  test('should be defined', async () => {
    expect(app).toBeDefined();
  });

  test('/status (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/status');
    expect(response.status).toBe(200);
  });
});
