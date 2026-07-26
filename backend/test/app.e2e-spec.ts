process.env.AUTH0_ISSUER ??= 'https://test.example.com/';
process.env.AUTH0_AUDIENCE ??= 'https://test-api';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // The AuthGuard is registered globally (APP_GUARD), so every route —
  // including this one — now requires a valid bearer token.
  it('/ (GET) rejects unauthenticated requests', () => {
    return request(app.getHttpServer()).get('/').expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
