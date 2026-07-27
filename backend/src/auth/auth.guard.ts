import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { IS_PUBLIC_KEY } from './public.decorator';

const issuer = process.env.AUTH0_ISSUER;
const audience = process.env.AUTH0_AUDIENCE;

if (!issuer || !audience) {
  throw new Error(
    'AUTH0_ISSUER and AUTH0_AUDIENCE must be set to verify access tokens',
  );
}

// Created once at module load, not per-request: jose caches the fetched keys
// internally and refetches only when it sees an unfamiliar `kid`, so re-using
// this instance is what makes that caching (and JWKS rotation) actually work.
const jwks = createRemoteJWKSet(new URL('.well-known/jwks.json', issuer));

export interface AuthenticatedRequest extends Request {
  user: { ownerId: string };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      // jwtVerify does all four checks in one call:
      // - signature: fetches the RSA public key matching the token's `kid` from
      //   the tenant's JWKS and verifies it cryptographically.
      // - algorithms: pinned to RS256 explicitly rather than trusting the
      //   token's own `alg` header, which is what stops an "alg confusion"
      //   attack (e.g. a forged HS256 token signed with the public key as if
      //   it were a shared secret).
      // - `iss`/`aud`: rejected unless they exactly match this API's tenant
      //   and audience, so a token meant for a different Auth0 API or a
      //   different tenant is refused even if validly signed.
      // - `exp` (and `nbf`/`iat`): checked against the current time by default.
      const { payload } = await jwtVerify(token, jwks, {
        issuer,
        audience,
        algorithms: ['RS256'],
      });

      if (typeof payload.sub !== 'string') {
        throw new UnauthorizedException('Token missing sub claim');
      }

      // `sub` is the stable, unique subject identifier Auth0 assigns per user
      // — it's what the rest of the app should use as ownerId, never a claim
      // like `email` that the user could change.
      request.user = { ownerId: payload.sub };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

function extractBearerToken(request: Request): string | undefined {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
  return scheme === 'Bearer' ? token : undefined;
}
