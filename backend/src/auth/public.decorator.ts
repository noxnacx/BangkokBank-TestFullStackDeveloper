import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Opts a single route out of the global AuthGuard (see auth.guard.ts) --
// for the handful of endpoints that must work with no bearer token at all,
// like a public share link.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
