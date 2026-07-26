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
  Query,
  Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { ListBookmarksQueryDto } from './dto/list-bookmarks-query.dto';
import { PatchBookmarkDto } from './dto/patch-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  findAll(
    @Query() query: ListBookmarksQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bookmarksService.findAll(req.user.ownerId, query.collectionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.bookmarksService.findOne(id, req.user.ownerId);
  }

  @Post()
  create(@Body() dto: CreateBookmarkDto, @Req() req: AuthenticatedRequest) {
    // ownerId always comes from the verified token, never the request body.
    return this.bookmarksService.create(dto, req.user.ownerId);
  }

  @Put(':id')
  replace(
    @Param('id') id: string,
    @Body() dto: UpdateBookmarkDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bookmarksService.replace(id, req.user.ownerId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: PatchBookmarkDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bookmarksService.update(id, req.user.ownerId, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    await this.bookmarksService.remove(id, req.user.ownerId);
  }
}
