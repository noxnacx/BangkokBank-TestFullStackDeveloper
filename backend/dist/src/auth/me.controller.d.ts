import type { AuthenticatedRequest } from './auth.guard';
export declare class MeController {
    getMe(request: AuthenticatedRequest): {
        ownerId: string;
    };
}
