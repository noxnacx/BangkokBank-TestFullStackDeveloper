import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { CollectionsService } from './collections.service';

// Deliberately separate from CollectionsController: everything here is
// public (@Public(), no bearer token) and read-only by construction --
// there is no update/delete route in this controller at all, so there's no
// path through here that could mutate anything even if the service allowed
// it.
@Controller('shared')
export class SharedController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Public()
  @Get(':token')
  getShared(@Param('token') token: string) {
    return this.collectionsService.getSharedView(token);
  }
}
