// Real end-to-end verification of AuthGuard: no mocking of `jose`. We spin up
// a local HTTP server that serves an actual JWKS (our own RS256 keypair) and
// point AUTH0_ISSUER at it, so the guard fetches and verifies real signatures
// exactly like it would against the real Auth0 tenant.
const JWKS_PORT = 51823;
process.env.AUTH0_ISSUER = `http://127.0.0.1:${JWKS_PORT}/`;
process.env.AUTH0_AUDIENCE = 'https://test-api';

import { createServer, type Server } from 'node:http';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SignJWT, exportJWK, generateKeyPair, type KeyLike } from 'jose';
import { AuthGuard } from './../src/auth/auth.guard';
import { MeController } from './../src/auth/me.controller';

const KID = 'test-key-1';
const REAL_ISSUER = process.env.AUTH0_ISSUER;
const REAL_AUDIENCE = process.env.AUTH0_AUDIENCE;

describe('Auth flow (e2e, real JWKS verification over HTTP)', () => {
  let app: INestApplication;
  let jwksServer: Server;
  let privateKey: KeyLike;
  let wrongAlgPrivateKey: KeyLike;

  beforeAll(async () => {
    const { publicKey, privateKey: signingKey } =
      await generateKeyPair('RS256');
    privateKey = signingKey;
    const jwk = await exportJWK(publicKey);

    // WebCrypto ties a CryptoKey to a single algorithm, so the RS256 key
    // above cannot also sign PS256 — a separate keypair is needed purely to
    // produce a token with a disallowed `alg` header for that test case.
    ({ privateKey: wrongAlgPrivateKey } = await generateKeyPair('PS256'));

    jwksServer = createServer((_req, res) => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ keys: [{ ...jwk, kid: KID, use: 'sig' }] }));
    });
    await new Promise<void>((resolve) =>
      jwksServer.listen(JWKS_PORT, '127.0.0.1', resolve),
    );

    // A minimal module wired the same way as AppModule (global APP_GUARD +
    // the real MeController) — deliberately excludes PrismaModule, which has
    // nothing to do with auth and would drag in a real DB connection attempt.
    const moduleFixture = await Test.createTestingModule({
      controllers: [MeController],
      providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await new Promise<void>((resolve) => jwksServer.close(() => resolve()));
  });

  function signToken(overrides: {
    sub?: string;
    issuer?: string;
    audience?: string;
    alg?: 'RS256' | 'PS256';
    expSecondsFromNow?: number;
  } = {}) {
    const alg = overrides.alg ?? 'RS256';
    return new SignJWT({})
      .setProtectedHeader({ alg, kid: KID })
      .setSubject(overrides.sub ?? 'auth0|e2e-test-user')
      .setIssuer(overrides.issuer ?? REAL_ISSUER!)
      .setAudience(overrides.audience ?? REAL_AUDIENCE!)
      .setIssuedAt()
      .setExpirationTime(
        Math.floor(Date.now() / 1000) + (overrides.expSecondsFromNow ?? 300),
      )
      .sign(alg === 'RS256' ? privateKey : wrongAlgPrivateKey);
  }

  it('accepts a validly signed token and returns the sub as ownerId', async () => {
    const token = await signToken();
    await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect({ ownerId: 'auth0|e2e-test-user' });
  });

  it('rejects a token issued for the wrong audience', async () => {
    const token = await signToken({ audience: 'https://someone-elses-api' });
    await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it('rejects a token from the wrong issuer', async () => {
    const token = await signToken({
      issuer: 'https://not-our-tenant.example.com/',
    });
    await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it('rejects an expired token', async () => {
    const token = await signToken({ expSecondsFromNow: -60 });
    await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it('rejects a token signed with a disallowed algorithm (PS256)', async () => {
    // Same key, same valid claims — only the alg differs. This is the guard's
    // explicit `algorithms: ['RS256']` pin doing its job, not a JWKS/kid miss.
    const token = await signToken({ alg: 'PS256' });
    await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });
});
