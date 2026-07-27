import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { SharedController } from './shared.controller';
import { CollectionsService } from './collections.service';

@Module({
  controllers: [CollectionsController, SharedController],
  providers: [CollectionsService],
})
export class CollectionsModule {}
