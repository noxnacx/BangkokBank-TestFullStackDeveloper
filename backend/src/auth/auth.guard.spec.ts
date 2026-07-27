process.env.AUTH0_ISSUER = 'https://test.example.com/';
process.env.AUTH0_AUDIENCE = 'https://test-api';

jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn(() => jest.fn()),
  jwtVerify: jest.fn(),
}));

import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { jwtVerify } from 'jose';
import { AuthGuard } from './auth.guard';

const verifyMock = jwtVerify as jest.Mock;

function contextWithRequest(request: {
  headers: Record<string, string>;
  user?: unknown;
}): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  // Reflector.getAllAndOverride returns undefined when no `@Public()`
  // metadata is present -- exactly what a real Reflector does for every
  // route in these tests, none of which are marked public.
  const reflector = { getAllAndOverride: () => undefined } as unknown as Reflector;
  const guard = new AuthGuard(reflector);

  afterEach(() => jest.clearAllMocks());

  it('rejects a request with no Authorization header', async () => {
    const ctx = contextWithRequest({ headers: {} });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('rejects a non-Bearer scheme', async () => {
    const ctx = contextWithRequest({ headers: { authorization: 'Basic xyz' } });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('rejects when signature/audience/issuer/expiry verification fails', async () => {
    verifyMock.mockRejectedValueOnce(new Error('signature verification failed'));
    const ctx = contextWithRequest({
      headers: { authorization: 'Bearer bad.token.here' },
    });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('attaches sub as ownerId and allows the request through on a valid token', async () => {
    verifyMock.mockResolvedValueOnce({ payload: { sub: 'auth0|abc123' } });
    const request = { headers: { authorization: 'Bearer good.token.here' } };
    const ctx = contextWithRequest(request);

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request).toHaveProperty('user', { ownerId: 'auth0|abc123' });
  });

  it('lets a @Public() route through with no token and never touches jwtVerify', async () => {
    const publicReflector = { getAllAndOverride: () => true } as unknown as Reflector;
    const publicGuard = new AuthGuard(publicReflector);
    const ctx = contextWithRequest({ headers: {} });

    await expect(publicGuard.canActivate(ctx)).resolves.toBe(true);
    expect(verifyMock).not.toHaveBeenCalled();
  });
});
