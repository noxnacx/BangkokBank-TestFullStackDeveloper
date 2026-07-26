import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { PatchBookmarkDto } from './dto/patch-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(ownerId: string, collectionId?: string) {
    return this.prisma.bookmark.findMany({
      where: { ownerId, ...(collectionId !== undefined && { collectionId }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, ownerId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id, ownerId },
    });
    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }
    return bookmark;
  }

  async create(dto: CreateBookmarkDto, ownerId: string) {
    await this.assertCollectionOwnership(dto.collectionId, ownerId);
    return this.prisma.bookmark.create({
      data: {
        url: dto.url,
        title: dto.title,
        notes: dto.notes ?? null,
        ownerId,
        collectionId: dto.collectionId ?? null,
      },
    });
  }

  async replace(id: string, ownerId: string, dto: UpdateBookmarkDto) {
    await this.assertCollectionOwnership(dto.collectionId, ownerId);
    return this.mutate(id, ownerId, {
      url: dto.url,
      title: dto.title,
      notes: dto.notes ?? null,
      collectionId: dto.collectionId ?? null,
    });
  }

  async update(id: string, ownerId: string, dto: PatchBookmarkDto) {
    if (dto.collectionId !== undefined) {
      await this.assertCollectionOwnership(dto.collectionId, ownerId);
    }
    return this.mutate(id, ownerId, {
      url: dto.url,
      title: dto.title,
      notes: dto.notes,
      collectionId: dto.collectionId,
    });
  }

  async remove(id: string, ownerId: string) {
    try {
      await this.prisma.bookmark.delete({ where: { id, ownerId } });
    } catch (error) {
      this.rethrowAsNotFoundIfMissing(error);
    }
  }

  private async mutate(
    id: string,
    ownerId: string,
    data: Prisma.BookmarkUncheckedUpdateInput,
  ) {
    try {
      return await this.prisma.bookmark.update({ where: { id, ownerId }, data });
    } catch (error) {
      this.rethrowAsNotFoundIfMissing(error);
    }
  }

  // A collectionId that doesn't exist and one that belongs to another owner
  // must look identical to the caller -- both are just "not usable by you" --
  // otherwise the response would leak whether a given collectionId exists
  // for someone else. 400, not 404: the resource being acted on is the
  // bookmark (which IS found), not the collection; this is invalid input on
  // a body field, the same category as a validation error, not a "route
  // target missing" error.
  private async assertCollectionOwnership(
    collectionId: string | null | undefined,
    ownerId: string,
  ) {
    if (collectionId === undefined || collectionId === null) {
      return;
    }
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId, ownerId },
    });
    if (!collection) {
      throw new BadRequestException(
        'collectionId does not refer to a collection you own',
      );
    }
  }

  private rethrowAsNotFoundIfMissing(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Bookmark not found');
    }
    throw error;
  }
}
