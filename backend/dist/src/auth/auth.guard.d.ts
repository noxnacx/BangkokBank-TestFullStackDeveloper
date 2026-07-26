import { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
export interface AuthenticatedRequest extends Request {
    user: {
        ownerId: string;
    };
}
export declare class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): Promise<boolean>;
}
