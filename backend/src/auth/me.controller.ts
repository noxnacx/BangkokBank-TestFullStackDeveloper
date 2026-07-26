import { Controller, Get, Req } from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.guard';

@Controller('me')
export class MeController {
  @Get()
  getMe(@Req() request: AuthenticatedRequest) {
    return { ownerId: request.user.ownerId };
  }
}
