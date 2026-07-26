import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { PatchCollectionDto } from './dto/patch-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.collectionsService.findAll(req.user.ownerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.collectionsService.findOne(id, req.user.ownerId);
  }

  @Get(':id/bookmarks')
  findBookmarks(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.collectionsService.findBookmarks(id, req.user.ownerId);
  }

  @Post()
  create(@Body() dto: CreateCollectionDto, @Req() req: AuthenticatedRequest) {
    // ownerId always comes from the verified token, never the request body.
    return this.collectionsService.create(dto, req.user.ownerId);
  }

  @Put(':id')
  replace(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.collectionsService.update(id, req.user.ownerId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: PatchCollectionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.collectionsService.update(id, req.user.ownerId, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    await this.collectionsService.remove(id, req.user.ownerId);
  }
}
